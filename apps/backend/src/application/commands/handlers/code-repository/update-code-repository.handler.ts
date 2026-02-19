import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateCodeRepositoryCommand } from '../../impl/code-repository/update-code-repository.command';
import type { CodeRepositoryRepository } from '../../../../domain/repositories/code-repository.repository.interface';
import { CODE_REPOSITORY_REPOSITORY } from '../../../../domain/repositories/code-repository.repository.interface';
import type { CodeRepository } from '../../../../domain/entities/code-repository.entity';

@CommandHandler(UpdateCodeRepositoryCommand)
export class UpdateCodeRepositoryHandler implements ICommandHandler<UpdateCodeRepositoryCommand> {
  constructor(
    @Inject(CODE_REPOSITORY_REPOSITORY)
    private readonly codeRepositoryRepository: CodeRepositoryRepository,
  ) {}

  async execute(command: UpdateCodeRepositoryCommand): Promise<CodeRepository> {
    const { id, dto } = command;

    const codeRepository = await this.codeRepositoryRepository.findById(id);
    if (!codeRepository) {
      throw new NotFoundException(`CodeRepository with ID ${id} not found`);
    }

    const updateData: Partial<
      Omit<CodeRepository, 'id' | 'createdAt' | 'updatedAt'>
    > = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined)
      updateData.description = dto.description ?? null;
    if (dto.repositoryUrl !== undefined)
      updateData.repositoryUrl = dto.repositoryUrl;
    if (dto.repositoryType !== undefined)
      updateData.repositoryType = dto.repositoryType;
    if (dto.repositoryId !== undefined)
      updateData.repositoryId = dto.repositoryId ?? null;

    const updated = await this.codeRepositoryRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(
        `CodeRepository with ID ${id} not found after update`,
      );
    }

    return updated;
  }
}
