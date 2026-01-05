import { ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UserUseCases {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    // TODO: Hash password before storing (use bcrypt or similar)
    return this.userRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      password: createUserDto.password, // Should be hashed
      role: createUserDto.role,
    });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(
        updateUserDto.email,
      );
      if (existingUser) {
        throw new ConflictException(
          `User with email ${updateUserDto.email} already exists`,
        );
      }
    }

    const updateData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> =
      {};
    if (updateUserDto.email !== undefined)
      updateData.email = updateUserDto.email;
    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.password !== undefined)
      updateData.password = updateUserDto.password; // Should be hashed
    if (updateUserDto.role !== undefined) updateData.role = updateUserDto.role;

    const updated = await this.userRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found after update`);
    }
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.delete(id);
  }
}
