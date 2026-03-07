import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateProjectCommand } from '../../impl/project/create-project.command';
import type { IProjectRepository } from '../../../../domain/repositories/project.repository.interface';
import { PROJECT_REPOSITORY } from '../../../../domain/repositories/project.repository.interface';
import type { IWorkflowRepository } from '../../../../domain/repositories/workflow.repository.interface';
import { WORKFLOW_REPOSITORY } from '../../../../domain/repositories/workflow.repository.interface';
import type { Project } from '../../../../domain/entities/project.entity';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(WORKFLOW_REPOSITORY)
    private readonly workflowRepository: IWorkflowRepository,
  ) {}

  async execute(command: CreateProjectCommand): Promise<Project> {
    const { dto } = command;

    const project = await this.projectRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      status: dto.status!,
    });

    // Seed the default workflow for the new project
    await this.workflowRepository.seedDefaultWorkflow(project.id);

    return project;
  }
}
