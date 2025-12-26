import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './modules/task.module';
import kyselyConfig from './infrastructure/config/kysely.config';
import appConfig from './infrastructure/config/app.config';
import type { KyselyDatabase } from './infrastructure/config/kysely.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [kyselyConfig, appConfig],
    }),
    TaskModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
})
export class AppModule {}
