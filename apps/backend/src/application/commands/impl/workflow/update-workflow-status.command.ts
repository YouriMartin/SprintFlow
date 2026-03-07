import type { UpdateWorkflowStatusDto } from '../../../dtos/update-workflow-status.dto';

export class UpdateWorkflowStatusCommand {
  constructor(
    public readonly statusId: string,
    public readonly dto: UpdateWorkflowStatusDto,
  ) {}
}
