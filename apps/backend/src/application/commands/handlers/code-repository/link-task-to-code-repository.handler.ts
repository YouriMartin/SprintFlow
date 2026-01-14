import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { LinkTaskToCodeRepositoryCommand } from '../../impl/code-repository/link-task-to-code-repository.command';
import type { CodeRepositoryRepository } from '../../../../domain/repositories/code-repository.repository.interface';
import { CODE_REPOSITORY_REPOSITORY } from '../../../../domain/repositories/code-repository.repository.interface';
import type { UserStoryRepository } from '../../../../domain/repositories/user-story.repository.interface';
import { USER_STORY_REPOSITORY } from '../../../../domain/repositories/user-story.repository.interface';

@CommandHandler(LinkTaskToCodeRepositoryCommand)
export class LinkTaskToCodeRepositoryHandler
  implements ICommandHandler<LinkTaskToCodeRepositoryCommand>
{
  constructor(
    @Inject(CODE_REPOSITORY_REPOSITORY)
    private readonly codeRepositoryRepository: CodeRepositoryRepository,
    @Inject(USER_STORY_REPOSITORY)
    private readonly userStoryRepository: UserStoryRepository,
  ) {}

  async execute(command: LinkTaskToCodeRepositoryCommand): Promise<void> {
    const { taskId, codeRepositoryId } = command;

    const codeRepository = await this.codeRepositoryRepository.findById(codeRepositoryId);
    if (!codeRepository) {
      throw new NotFoundException(`Code repository with id ${codeRepositoryId} not found`);
    }

    const userStory = await this.userStoryRepository.findById(taskId);
    if (!userStory) {
      throw new NotFoundException(`User story with id ${taskId} not found`);
    }

    await this.codeRepositoryRepository.linkToUserStory(codeRepositoryId, taskId);
  }
}
