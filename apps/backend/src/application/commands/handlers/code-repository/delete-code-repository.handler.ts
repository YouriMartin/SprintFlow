import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteCodeRepositoryCommand } from '../../impl/code-repository/delete-code-repository.command';
import type { CodeRepositoryRepository } from '../../../../domain/repositories/code-repository.repository.interface';
import { CODE_REPOSITORY_REPOSITORY } from '../../../../domain/repositories/code-repository.repository.interface';

@CommandHandler(DeleteCodeRepositoryCommand)
export class DeleteCodeRepositoryHandler
  implements ICommandHandler<DeleteCodeRepositoryCommand>
{
  constructor(
    @Inject(CODE_REPOSITORY_REPOSITORY)
    private readonly codeRepositoryRepository: CodeRepositoryRepository,
  ) {}

  async execute(command: DeleteCodeRepositoryCommand): Promise<void> {
    const { id } = command;

    const codeRepository = await this.codeRepositoryRepository.findById(id);
    if (!codeRepository) {
      throw new NotFoundException(`CodeRepository with ID ${id} not found`);
    }

    await this.codeRepositoryRepository.delete(id);
  }
}
