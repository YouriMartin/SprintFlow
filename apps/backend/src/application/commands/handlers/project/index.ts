import { CreateProjectHandler } from './create-project.handler';
import { UpdateProjectHandler } from './update-project.handler';
import { DeleteProjectHandler } from './delete-project.handler';

export const ProjectCommandHandlers = [
  CreateProjectHandler,
  UpdateProjectHandler,
  DeleteProjectHandler,
];

export * from './create-project.handler';
export * from './update-project.handler';
export * from './delete-project.handler';
