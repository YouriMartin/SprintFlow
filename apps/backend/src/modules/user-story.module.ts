import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserStoryRepository } from '../infrastructure/database/user-story.repository';
import { USER_STORY_REPOSITORY } from '../domain/repositories/user-story.repository.interface';
import { UserStoryController } from '../presentation/controllers/user-story.controller';
import { CodeRepositoryModule } from './code-repository.module';
import { UserStoryCommandHandlers } from '../application/commands/handlers/user-story';
import { UserStoryQueryHandlers } from '../application/queries/handlers/user-story';

@Module({
  imports: [CqrsModule, CodeRepositoryModule],
  controllers: [UserStoryController],
  providers: [
    {
      provide: USER_STORY_REPOSITORY,
      useClass: UserStoryRepository,
    },
    ...UserStoryCommandHandlers,
    ...UserStoryQueryHandlers,
  ],
  exports: [USER_STORY_REPOSITORY],
})
export class UserStoryModule {}
