import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSetupStatusQuery } from '../../impl/setup/get-setup-status.query';
import type { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../domain/repositories/user.repository.interface';

@QueryHandler(GetSetupStatusQuery)
export class GetSetupStatusHandler
  implements IQueryHandler<GetSetupStatusQuery>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Returns whether initial setup is required (no users in the database)
   * @returns Object with required flag set to true if no users exist
   */
  async execute(): Promise<{ required: boolean }> {
    const count = await this.userRepository.count();
    return { required: count === 0 };
  }
}
