import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateProjectCommand } from '../../impl/project/create-project.command';
import type { IProjectRepository } from '../../../../domain/repositories/project.repository.interface';
import { PROJECT_REPOSITORY } from '../../../../domain/repositories/project.repository.interface';
import type { Project } from '../../../../domain/entities/project.entity';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(command: CreateProjectCommand): Promise<Project> {
    const { dto } = command;

    return this.projectRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      status: dto.status!,
    });
  }
}
