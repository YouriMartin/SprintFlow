import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UnlinkTaskFromCodeRepositoryCommand } from '../../impl/code-repository/unlink-task-from-code-repository.command';
import type { CodeRepositoryRepository } from '../../../../domain/repositories/code-repository.repository.interface';
import { CODE_REPOSITORY_REPOSITORY } from '../../../../domain/repositories/code-repository.repository.interface';

@CommandHandler(UnlinkTaskFromCodeRepositoryCommand)
export class UnlinkTaskFromCodeRepositoryHandler implements ICommandHandler<UnlinkTaskFromCodeRepositoryCommand> {
  constructor(
    @Inject(CODE_REPOSITORY_REPOSITORY)
    private readonly codeRepositoryRepository: CodeRepositoryRepository,
  ) {}

  async execute(command: UnlinkTaskFromCodeRepositoryCommand): Promise<void> {
    const { taskId, codeRepositoryId } = command;

    await this.codeRepositoryRepository.unlinkFromUserStory(
      codeRepositoryId,
      taskId,
    );
  }
}
