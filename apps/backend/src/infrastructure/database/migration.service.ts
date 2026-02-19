import { Injectable, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { readFileSync, readdirSync } from 'fs';
import * as path from 'path';
import { sql } from 'kysely';
import type { KyselyDatabase } from '../config/kysely.config';

@Injectable()
export class MigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationService.name);
  // __dirname at runtime: dist/infrastructure/database → ../../.. = apps/backend root
  private readonly migrationsPath = path.resolve(__dirname, '../../..', 'migrations');

  constructor(@Inject('kysely') private readonly db: KyselyDatabase) {}

  /**
   * Automatically runs pending migrations on application bootstrap in non-production environments
   */
  async onApplicationBootstrap(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      await this.runPendingMigrations();
    }
  }

  /**
   * Ensures the schema_migrations table exists, then applies all pending SQL files in sorted order
   * @throws Error if any migration fails (app will not start)
   */
  async runPendingMigrations(): Promise<void> {
    await this.ensureMigrationsTable();
    const applied = await this.getAppliedMigrations();
    const pending = this.getPendingFiles(applied);

    if (pending.length === 0) {
      this.logger.log('Database is up to date');
      return;
    }

    for (const filename of pending) {
      await this.applyMigration(filename);
      this.logger.log(`Applied: ${filename}`);
    }

    this.logger.log(`${pending.length} migration(s) applied`);
  }

  /**
   * Creates the schema_migrations tracking table if it does not already exist
   */
  private async ensureMigrationsTable(): Promise<void> {
    await this.db.schema
      .createTable('schema_migrations')
      .ifNotExists()
      .addColumn('filename', 'varchar', (col) => col.notNull().primaryKey())
      .addColumn('applied_at', 'timestamp', (col) =>
        col.notNull().defaultTo(sql`now()`),
      )
      .execute();
  }

  /**
   * Fetches all migration filenames already recorded in schema_migrations
   * @returns Set of applied migration filenames
   */
  private async getAppliedMigrations(): Promise<Set<string>> {
    const rows = await this.db
      .selectFrom('schema_migrations')
      .select('filename')
      .execute();
    return new Set(rows.map((r) => r.filename));
  }

  /**
   * Reads the migrations directory and returns SQL files not yet applied, sorted alphabetically
   * @param applied - Set of already-applied migration filenames
   * @returns Sorted array of pending migration filenames
   */
  private getPendingFiles(applied: Set<string>): string[] {
    return readdirSync(this.migrationsPath)
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .filter((f) => !applied.has(f));
  }

  /**
   * Reads a SQL file, splits it into statements, and applies them in a single transaction.
   * Records the filename in schema_migrations within the same transaction.
   * @param filename - The SQL migration filename to apply
   * @throws Error if any statement fails (transaction is rolled back)
   */
  private async applyMigration(filename: string): Promise<void> {
    const filePath = path.join(this.migrationsPath, filename);
    const content = readFileSync(filePath, 'utf-8');
    const statements = content
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    await this.db.transaction().execute(async (trx) => {
      for (const stmt of statements) {
        await sql.raw(stmt).execute(trx);
      }
      await trx
        .insertInto('schema_migrations')
        .values({ filename, applied_at: new Date() })
        .execute();
    });
  }
}
