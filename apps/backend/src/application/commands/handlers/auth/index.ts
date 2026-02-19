import { LoginHandler } from './login.handler';
import { RefreshHandler } from './refresh.handler';
import { LogoutHandler } from './logout.handler';

export const AuthCommandHandlers = [
  LoginHandler,
  RefreshHandler,
  LogoutHandler,
];
