import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SeedWorkflowCommand } from '../../impl/workflow/seed-workflow.command';
import type { IWorkflowRepository } from '../../../../domain/repositories/workflow.repository.interface';
import { WORKFLOW_REPOSITORY } from '../../../../domain/repositories/workflow.repository.interface';

@CommandHandler(SeedWorkflowCommand)
export class SeedWorkflowHandler implements ICommandHandler<SeedWorkflowCommand> {
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly workflowRepository: IWorkflowRepository,
  ) {}

  /**
   * Seeds the default workflow for a project.
   * @param command - Command containing the projectId to seed
   */
  async execute(command: SeedWorkflowCommand): Promise<void> {
    await this.workflowRepository.seedDefaultWorkflow(command.projectId);
  }
}
