import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { KyselyDatabase } from '../config/kysely.config';

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
  ],
  exports: ['kysely'],
})
export class DatabaseModule {}
