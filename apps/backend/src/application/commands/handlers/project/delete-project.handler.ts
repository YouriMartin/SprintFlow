import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteProjectCommand } from '../../impl/project/delete-project.command';
import type { IProjectRepository } from '../../../../domain/repositories/project.repository.interface';
import { PROJECT_REPOSITORY } from '../../../../domain/repositories/project.repository.interface';

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler
  implements ICommandHandler<DeleteProjectCommand>
{
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(command: DeleteProjectCommand): Promise<void> {
    const { id } = command;

    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    await this.projectRepository.delete(id);
  }
}
