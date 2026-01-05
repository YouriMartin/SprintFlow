import { Module } from '@nestjs/common';
import { UserRepository } from '../infrastructure/database/user.repository';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';
import { UserUseCases } from '../application/use-cases/user.use-cases';
import { UserController } from '../presentation/controllers/user.controller';

@Module({
  controllers: [UserController],
  providers: [
    UserUseCases,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [UserUseCases, USER_REPOSITORY],
})
export class UserModule {}
