import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user.module';
import { ProjectModule } from './modules/project.module';
import { EpicModule } from './modules/epic.module';
import { SprintModule } from './modules/sprint.module';
import { UserStoryModule } from './modules/user-story.module';
import { CodeRepositoryModule } from './modules/code-repository.module';
import { SetupModule } from './modules/setup.module';
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
    UserModule,
    ProjectModule,
    EpicModule,
    SprintModule,
    UserStoryModule,
    CodeRepositoryModule,
    SetupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
