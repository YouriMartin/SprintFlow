import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { KyselyDatabase } from '../config/kysely.config';
import { MigrationService } from './migration.service';

@Global()
@Module({
  providers: [
    {
      provide: 'kysely',
      useFactory: (configService: ConfigService): KyselyDatabase => {
        const db = configService.get<KyselyDatabase>('kysely');
        if (!db) {
          throw new Error('Kysely database configuration not found');
        }
        return db;
      },
      inject: [ConfigService],
    },
    MigrationService,
  ],
  exports: ['kysely', MigrationService],
})
export class DatabaseModule {}
