import {Inject, Injectable} from '@nestjs/common';
import {UserStory, UserStoryPriority, UserStoryStatus,} from '../../domain/entities/user-story.entity';
import {IUserStoryRepository} from '../../domain/repositories/user-story.repository.interface';
import type {KyselyDatabase, UserStoryTable} from '../config/kysely.config';

@Injectable()
export class UserStoryRepository implements IUserStoryRepository {
  constructor(
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  async findAll(): Promise<UserStory[]> {
    const userStories = await this.db.selectFrom('user_stories').selectAll().execute();
    return userStories.map((userStory) => this.mapToUserStory(userStory));
  }

  async findById(id: string): Promise<UserStory | null> {
    const userStory = await this.db
      .selectFrom('user_stories')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return userStory ? this.mapToUserStory(userStory) : null;
  }

  async create(userStory: Partial<UserStory>): Promise<UserStory> {
    const now = new Date();
    const newUserStory = await this.db
      .insertInto('user_stories')
      .values({
        id: crypto.randomUUID(),
        title: userStory.title!,
        description: userStory.description || null,
        status: userStory.status || UserStoryStatus.TODO,
        priority: userStory.priority || UserStoryPriority.MEDIUM,
        assignee: userStory.assignee || null,
        due_date: userStory.dueDate || null,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToUserStory(newUserStory);
  }

  async update(id: string, userStory: Partial<UserStory>): Promise<UserStory> {
    const updateData: Partial<UserStoryTable> = {
      updated_at: new Date(),
    };

    if (userStory.title !== undefined) updateData.title = userStory.title;
    if (userStory.description !== undefined)
      updateData.description = userStory.description;
    if (userStory.status !== undefined) updateData.status = userStory.status;
    if (userStory.priority !== undefined) updateData.priority = userStory.priority;
    if (userStory.assignee !== undefined) updateData.assignee = userStory.assignee;
    if (userStory.dueDate !== undefined) updateData.due_date = userStory.dueDate;

    const updatedUserStory = await this.db
      .updateTable('user_stories')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!updatedUserStory) {
      throw new Error('UserStory not found after update');
    }

    return this.mapToUserStory(updatedUserStory);
  }

  async delete(id: string): Promise<void> {
    await this.db.deleteFrom('user_stories').where('id', '=', id).execute();
  }

  private mapToUserStory(dbUserStory: UserStoryTable): UserStory {
    return {
      id: dbUserStory.id,
      title: dbUserStory.title,
      description: dbUserStory.description,
      status: dbUserStory.status as UserStoryStatus,
      priority: dbUserStory.priority as UserStoryPriority,
      assignee: dbUserStory.assignee,
      dueDate: dbUserStory.due_date,
      createdAt: dbUserStory.created_at,
      updatedAt: dbUserStory.updated_at,
    };
  }
}
