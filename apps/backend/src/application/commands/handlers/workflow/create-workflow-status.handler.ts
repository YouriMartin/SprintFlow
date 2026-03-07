import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateWorkflowStatusCommand } from '../../impl/workflow/create-workflow-status.command';
import type { IWorkflowRepository } from '../../../../domain/repositories/workflow.repository.interface';
import { WORKFLOW_REPOSITORY } from '../../../../domain/repositories/workflow.repository.interface';
import type { WorkflowStatus } from '../../../../domain/entities/workflow-status.entity';

@CommandHandler(CreateWorkflowStatusCommand)
export class CreateWorkflowStatusHandler
  implements ICommandHandler<CreateWorkflowStatusCommand>
{
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly workflowRepository: IWorkflowRepository,
  ) {}

  /**
   * Creates a new workflow status for a project.
   * @param command - Command containing projectId and status DTO
   * @returns The created workflow status
   */
  async execute(command: CreateWorkflowStatusCommand): Promise<WorkflowStatus> {
    const { projectId, dto } = command;

    return this.workflowRepository.createStatus({
      projectId,
      key: dto.key,
      label: dto.label,
      groupNames: dto.groupNames ?? [],
      sortOrder: dto.sortOrder ?? 0,
      color: dto.color ?? '#6b7280',
      isInitial: dto.isInitial ?? false,
      isTerminal: dto.isTerminal ?? false,
      posX: dto.posX ?? 100,
      posY: dto.posY ?? 100,
    });
  }
}
