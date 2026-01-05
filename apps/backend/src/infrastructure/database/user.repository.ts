import { Inject, Injectable } from '@nestjs/common';
import { User, UserRole } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { KyselyDatabase, UserTable } from '../config/kysely.config';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.db.selectFrom('users').selectAll().execute();
    return users.map((user) => this.mapToUser(user));
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    return user ? this.mapToUser(user) : null;
  }

  async create(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    const now = new Date();
    const newUser = await this.db
      .insertInto('users')
      .values({
        id: crypto.randomUUID(),
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToUser(newUser);
  }

  async update(
    id: string,
    user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<User | null> {
    const updateData: Partial<UserTable> = {
      updated_at: new Date(),
    };

    if (user.email !== undefined) updateData.email = user.email;
    if (user.name !== undefined) updateData.name = user.name;
    if (user.password !== undefined) updateData.password = user.password;
    if (user.role !== undefined) updateData.role = user.role;

    const updatedUser = await this.db
      .updateTable('users')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return updatedUser ? this.mapToUser(updatedUser) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.deleteFrom('users').where('id', '=', id).execute();
  }

  private mapToUser(dbUser: UserTable): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      password: dbUser.password,
      role: dbUser.role as UserRole,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }
}
