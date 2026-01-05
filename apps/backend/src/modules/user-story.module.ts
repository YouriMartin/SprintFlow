import {Module} from '@nestjs/common';
import {UserStoryRepository} from '../infrastructure/database/user-story.repository';
import {USER_STORY_REPOSITORY} from '../domain/repositories/user-story.repository.interface';
import {UserStoryUseCases} from '../application/use-cases/user-story.use-cases';
import {UserStoryController} from '../presentation/controllers/user-story.controller';
import {CodeRepositoryModule} from './code-repository.module';

@Module({
  imports: [CodeRepositoryModule],
  controllers: [UserStoryController],
  providers: [
    UserStoryUseCases,
    {
      provide: USER_STORY_REPOSITORY,
      useClass: UserStoryRepository,
    },
  ],
  exports: [UserStoryUseCases],
})
export class UserStoryModule {}
