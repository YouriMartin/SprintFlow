import type { CreateWorkflowTransitionDto } from '../../../dtos/create-workflow-transition.dto';

export class CreateWorkflowTransitionCommand {
  constructor(
    public readonly projectId: string,
    public readonly dto: CreateWorkflowTransitionDto,
  ) {}
}
