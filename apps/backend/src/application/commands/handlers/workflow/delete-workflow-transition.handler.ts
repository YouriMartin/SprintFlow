import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteWorkflowTransitionCommand } from '../../impl/workflow/delete-workflow-transition.command';
import type { IWorkflowRepository } from '../../../../domain/repositories/workflow.repository.interface';
import { WORKFLOW_REPOSITORY } from '../../../../domain/repositories/workflow.repository.interface';

@CommandHandler(DeleteWorkflowTransitionCommand)
export class DeleteWorkflowTransitionHandler
  implements ICommandHandler<DeleteWorkflowTransitionCommand>
{
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly workflowRepository: IWorkflowRepository,
  ) {}

  /**
   * Deletes a workflow transition.
   * @param command - Command containing the transitionId to delete
   */
  async execute(command: DeleteWorkflowTransitionCommand): Promise<void> {
    await this.workflowRepository.deleteTransition(command.transitionId);
  }
}
