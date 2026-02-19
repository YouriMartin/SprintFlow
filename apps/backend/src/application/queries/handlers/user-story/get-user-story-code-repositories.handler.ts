import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetUserStoryCodeRepositoriesQuery } from '../../impl/user-story/get-user-story-code-repositories.query';
import type { IUserStoryRepository } from '../../../../domain/repositories/user-story.repository.interface';
import { USER_STORY_REPOSITORY } from '../../../../domain/repositories/user-story.repository.interface';
import type { CodeRepositoryRepository } from '../../../../domain/repositories/code-repository.repository.interface';
import { CODE_REPOSITORY_REPOSITORY } from '../../../../domain/repositories/code-repository.repository.interface';
import type { CodeRepository } from '../../../../domain/entities/code-repository.entity';

@QueryHandler(GetUserStoryCodeRepositoriesQuery)
export class GetUserStoryCodeRepositoriesHandler implements IQueryHandler<GetUserStoryCodeRepositoriesQuery> {
  constructor(
    @Inject(USER_STORY_REPOSITORY)
    private readonly userStoryRepository: IUserStoryRepository,
    @Inject(CODE_REPOSITORY_REPOSITORY)
    private readonly codeRepositoryRepository: CodeRepositoryRepository,
  ) {}

  async execute(
    query: GetUserStoryCodeRepositoriesQuery,
  ): Promise<CodeRepository[]> {
    const userStory = await this.userStoryRepository.findById(
      query.userStoryId,
    );
    if (!userStory) {
      throw new NotFoundException(
        `UserStory with ID ${query.userStoryId} not found`,
      );
    }
    return this.codeRepositoryRepository.findByUserStoryId(query.userStoryId);
  }
}
