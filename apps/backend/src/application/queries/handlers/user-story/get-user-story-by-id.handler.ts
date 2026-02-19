import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetUserStoryByIdQuery } from '../../impl/user-story/get-user-story-by-id.query';
import type { IUserStoryRepository } from '../../../../domain/repositories/user-story.repository.interface';
import { USER_STORY_REPOSITORY } from '../../../../domain/repositories/user-story.repository.interface';
import type { UserStory } from '../../../../domain/entities/user-story.entity';

@QueryHandler(GetUserStoryByIdQuery)
export class GetUserStoryByIdHandler implements IQueryHandler<GetUserStoryByIdQuery> {
  constructor(
    @Inject(USER_STORY_REPOSITORY)
    private readonly userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(query: GetUserStoryByIdQuery): Promise<UserStory> {
    const userStory = await this.userStoryRepository.findById(query.id);
    if (!userStory) {
      throw new NotFoundException(`UserStory with ID ${query.id} not found`);
    }
    return userStory;
  }
}
