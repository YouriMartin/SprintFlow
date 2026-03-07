import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetWorkflowQuery } from '../../impl/workflow/get-workflow.query';
import type { IWorkflowRepository } from '../../../../domain/repositories/workflow.repository.interface';
import { WORKFLOW_REPOSITORY } from '../../../../domain/repositories/workflow.repository.interface';
import type { Workflow } from '../../../../domain/entities/workflow-status.entity';

@QueryHandler(GetWorkflowQuery)
export class GetWorkflowHandler implements IQueryHandler<GetWorkflowQuery> {
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly workflowRepository: IWorkflowRepository,
  ) {}

  /**
   * Returns the complete workflow (statuses + transitions) for a project.
   * @param query - Query containing the projectId
   * @returns Workflow with all statuses and transitions
   */
  async execute(query: GetWorkflowQuery): Promise<Workflow> {
    return this.workflowRepository.findWorkflow(query.projectId);
  }
}
