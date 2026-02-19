import 'reflect-metadata';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from './infrastructure/config/kysely.config';
import { MigrationService } from './infrastructure/database/migration.service';

/**
 * Standalone migration script for CI/prod use.
 * Run with: ts-node -r tsconfig-paths/register src/migrate.ts
 * Uses environment variables: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME.
 */
async function main(): Promise<void> {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'sprintflow',
      }),
    }),
    log: ['error'],
  });

  const service = new MigrationService(db as any);
  await service.runPendingMigrations();
  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
