export enum UserRole {
  SUPERADMIN = 'superadmin',
  DEV = 'dev',
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
