import { CreateWorkflowStatusHandler } from './create-workflow-status.handler';
import { UpdateWorkflowStatusHandler } from './update-workflow-status.handler';
import { DeleteWorkflowStatusHandler } from './delete-workflow-status.handler';
import { CreateWorkflowTransitionHandler } from './create-workflow-transition.handler';
import { DeleteWorkflowTransitionHandler } from './delete-workflow-transition.handler';
import { SeedWorkflowHandler } from './seed-workflow.handler';

export const WorkflowCommandHandlers = [
  CreateWorkflowStatusHandler,
  UpdateWorkflowStatusHandler,
  DeleteWorkflowStatusHandler,
  CreateWorkflowTransitionHandler,
  DeleteWorkflowTransitionHandler,
  SeedWorkflowHandler,
];

export * from './create-workflow-status.handler';
export * from './update-workflow-status.handler';
export * from './delete-workflow-status.handler';
export * from './create-workflow-transition.handler';
export * from './delete-workflow-transition.handler';
export * from './seed-workflow.handler';
