import { GetAllCodeRepositoriesHandler } from './get-all-code-repositories.handler';
import { GetCodeRepositoryByIdHandler } from './get-code-repository-by-id.handler';

export const CodeRepositoryQueryHandlers = [
  GetAllCodeRepositoriesHandler,
  GetCodeRepositoryByIdHandler,
];

export * from './get-all-code-repositories.handler';
export * from './get-code-repository-by-id.handler';
