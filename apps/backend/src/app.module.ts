import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './modules/task.module';
import { ProjectModule } from './modules/project.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import kyselyConfig from './infrastructure/config/kysely.config';
import appConfig from './infrastructure/config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [kyselyConfig, appConfig],
    }),
    DatabaseModule,
    TaskModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
