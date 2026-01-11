import { GetAllProjectsHandler } from './get-all-projects.handler';
import { GetProjectByIdHandler } from './get-project-by-id.handler';

export const ProjectQueryHandlers = [
  GetAllProjectsHandler,
  GetProjectByIdHandler,
];

export * from './get-all-projects.handler';
export * from './get-project-by-id.handler';
