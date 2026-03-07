import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteWorkflowStatusCommand } from '../../impl/workflow/delete-workflow-status.command';
import type { IWorkflowRepository } from '../../../../domain/repositories/workflow.repository.interface';
import { WORKFLOW_REPOSITORY } from '../../../../domain/repositories/workflow.repository.interface';

@CommandHandler(DeleteWorkflowStatusCommand)
export class DeleteWorkflowStatusHandler
  implements ICommandHandler<DeleteWorkflowStatusCommand>
{
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly workflowRepository: IWorkflowRepository,
  ) {}

  /**
   * Deletes a workflow status.
   * @param command - Command containing the statusId to delete
   * @throws NotFoundException if the status does not exist
   */
  async execute(command: DeleteWorkflowStatusCommand): Promise<void> {
    const { statusId } = command;

    const existing = await this.workflowRepository.findStatus(statusId);
    if (!existing) {
      throw new NotFoundException(
        `Workflow status with ID ${statusId} not found`,
      );
    }

    await this.workflowRepository.deleteStatus(statusId);
  }
}
