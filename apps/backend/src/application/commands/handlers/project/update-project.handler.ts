import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateProjectCommand } from '../../impl/project/update-project.command';
import type { IProjectRepository } from '../../../../domain/repositories/project.repository.interface';
import { PROJECT_REPOSITORY } from '../../../../domain/repositories/project.repository.interface';
import type { Project } from '../../../../domain/entities/project.entity';

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler
  implements ICommandHandler<UpdateProjectCommand>
{
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(command: UpdateProjectCommand): Promise<Project> {
    const { id, dto } = command;

    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const updateData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>> =
      {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined)
      updateData.description = dto.description ?? null;
    if (dto.status !== undefined) updateData.status = dto.status;

    const updated = await this.projectRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(
        `Project with ID ${id} not found after update`,
      );
    }

    return updated;
  }
}
