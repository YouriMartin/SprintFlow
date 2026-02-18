import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SetupCommand } from '../../impl/setup/setup.command';
import type { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../domain/repositories/user.repository.interface';
import { UserRole, type User } from '../../../../domain/entities/user.entity';

@CommandHandler(SetupCommand)
export class SetupHandler implements ICommandHandler<SetupCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Creates the first superadmin user during initial application setup
   * @param command - Setup command containing name, email, and password
   * @returns The created superadmin user
   * @throws BadRequestException if users already exist in the database
   */
  async execute(command: SetupCommand): Promise<User> {
    const count = await this.userRepository.count();
    if (count > 0) {
      throw new BadRequestException(
        'Setup already completed. Users already exist in the database.',
      );
    }

    const hashedPassword = await bcrypt.hash(command.dto.password, 10);

    return this.userRepository.create({
      email: command.dto.email,
      name: command.dto.name,
      password: hashedPassword,
      role: UserRole.SUPERADMIN,
    });
  }
}
