import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateWorkflowStatusCommand } from '../../impl/workflow/update-workflow-status.command';
import type { IWorkflowRepository } from '../../../../domain/repositories/workflow.repository.interface';
import { WORKFLOW_REPOSITORY } from '../../../../domain/repositories/workflow.repository.interface';
import type { WorkflowStatus } from '../../../../domain/entities/workflow-status.entity';

@CommandHandler(UpdateWorkflowStatusCommand)
export class UpdateWorkflowStatusHandler
  implements ICommandHandler<UpdateWorkflowStatusCommand>
{
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly workflowRepository: IWorkflowRepository,
  ) {}

  /**
   * Updates an existing workflow status.
   * @param command - Command containing statusId and partial update DTO
   * @returns The updated workflow status
   * @throws NotFoundException if the status does not exist
   */
  async execute(command: UpdateWorkflowStatusCommand): Promise<WorkflowStatus> {
    const { statusId, dto } = command;

    const existing = await this.workflowRepository.findStatus(statusId);
    if (!existing) {
      throw new NotFoundException(
        `Workflow status with ID ${statusId} not found`,
      );
    }

    return this.workflowRepository.updateStatus(statusId, {
      label: dto.label,
      groupNames: dto.groupNames,
      sortOrder: dto.sortOrder,
      color: dto.color,
      isInitial: dto.isInitial,
      isTerminal: dto.isTerminal,
      posX: dto.posX,
      posY: dto.posY,
    });
  }
}
