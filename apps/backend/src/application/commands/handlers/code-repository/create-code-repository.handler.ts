import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCodeRepositoryCommand } from '../../impl/code-repository/create-code-repository.command';
import type { CodeRepositoryRepository } from '../../../../domain/repositories/code-repository.repository.interface';
import { CODE_REPOSITORY_REPOSITORY } from '../../../../domain/repositories/code-repository.repository.interface';
import type { CodeRepository } from '../../../../domain/entities/code-repository.entity';

@CommandHandler(CreateCodeRepositoryCommand)
export class CreateCodeRepositoryHandler
  implements ICommandHandler<CreateCodeRepositoryCommand>
{
  constructor(
    @Inject(CODE_REPOSITORY_REPOSITORY)
    private readonly codeRepositoryRepository: CodeRepositoryRepository,
  ) {}

  async execute(command: CreateCodeRepositoryCommand): Promise<CodeRepository> {
    const { dto } = command;

    return this.codeRepositoryRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      repositoryUrl: dto.repositoryUrl,
      repositoryType: dto.repositoryType,
      repositoryId: dto.repositoryId ?? null,
    });
  }
}
