import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetUserByEmailQuery } from '../../impl/user/get-user-by-email.query';
import type { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../domain/repositories/user.repository.interface';
import type { User } from '../../../../domain/entities/user.entity';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByEmailQuery): Promise<User> {
    const user = await this.userRepository.findByEmail(query.email);
    if (!user) {
      throw new NotFoundException(`User with email ${query.email} not found`);
    }
    return user;
  }
}
