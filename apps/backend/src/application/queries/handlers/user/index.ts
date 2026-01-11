import { GetAllUsersHandler } from './get-all-users.handler';
import { GetUserByIdHandler } from './get-user-by-id.handler';
import { GetUserByEmailHandler } from './get-user-by-email.handler';

export const UserQueryHandlers = [
  GetAllUsersHandler,
  GetUserByIdHandler,
  GetUserByEmailHandler,
];

export * from './get-all-users.handler';
export * from './get-user-by-id.handler';
export * from './get-user-by-email.handler';
