import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {EpicModule} from './modules/epic.module';
import {UserStoryModule} from './modules/user-story.module';
import {CodeRepositoryModule} from './modules/code-repository.module';
import {DatabaseModule} from './infrastructure/database/database.module';
import kyselyConfig from './infrastructure/config/kysely.config';
import appConfig from './infrastructure/config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [kyselyConfig, appConfig],
    }),
    DatabaseModule,
    EpicModule,
    UserStoryModule,
    CodeRepositoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
