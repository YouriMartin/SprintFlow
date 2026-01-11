import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserRepository } from '../infrastructure/database/user.repository';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';
import { UserController } from '../presentation/controllers/user.controller';
import { UserCommandHandlers } from '../application/commands/handlers/user';
import { UserQueryHandlers } from '../application/queries/handlers/user';

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    ...UserCommandHandlers,
    ...UserQueryHandlers,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
