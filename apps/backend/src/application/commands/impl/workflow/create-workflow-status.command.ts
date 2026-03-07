import type { CreateWorkflowStatusDto } from '../../../dtos/create-workflow-status.dto';

export class CreateWorkflowStatusCommand {
  constructor(
    public readonly projectId: string,
    public readonly dto: CreateWorkflowStatusDto,
  ) {}
}
