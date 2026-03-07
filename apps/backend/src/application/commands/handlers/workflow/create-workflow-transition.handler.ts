import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateWorkflowTransitionCommand } from '../../impl/workflow/create-workflow-transition.command';
import type { IWorkflowRepository } from '../../../../domain/repositories/workflow.repository.interface';
import { WORKFLOW_REPOSITORY } from '../../../../domain/repositories/workflow.repository.interface';
import type { WorkflowTransition } from '../../../../domain/entities/workflow-status.entity';

@CommandHandler(CreateWorkflowTransitionCommand)
export class CreateWorkflowTransitionHandler
  implements ICommandHandler<CreateWorkflowTransitionCommand>
{
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly workflowRepository: IWorkflowRepository,
  ) {}

  /**
   * Creates an allowed workflow transition between two statuses.
   * @param command - Command containing projectId and transition DTO
   * @returns The created workflow transition
   */
  async execute(
    command: CreateWorkflowTransitionCommand,
  ): Promise<WorkflowTransition> {
    const { projectId, dto } = command;

    return this.workflowRepository.createTransition({
      projectId,
      fromStatusId: dto.fromStatusId,
      toStatusId: dto.toStatusId,
    });
  }
}
