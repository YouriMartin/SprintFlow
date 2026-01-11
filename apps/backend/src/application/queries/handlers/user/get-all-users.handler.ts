import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllUsersQuery } from '../../impl/user/get-all-users.query';
import type { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../domain/repositories/user.repository.interface';
import type { User } from '../../../../domain/entities/user.entity';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
