import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllUserStoriesQuery } from '../../impl/user-story/get-all-user-stories.query';
import type { IUserStoryRepository } from '../../../../domain/repositories/user-story.repository.interface';
import { USER_STORY_REPOSITORY } from '../../../../domain/repositories/user-story.repository.interface';
import type { UserStory } from '../../../../domain/entities/user-story.entity';

@QueryHandler(GetAllUserStoriesQuery)
export class GetAllUserStoriesHandler
  implements IQueryHandler<GetAllUserStoriesQuery>
{
  constructor(
    @Inject(USER_STORY_REPOSITORY)
    private readonly userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(): Promise<UserStory[]> {
    return this.userStoryRepository.findAll();
  }
}
