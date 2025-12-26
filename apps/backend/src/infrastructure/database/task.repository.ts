import { Injectable, Inject } from '@nestjs/common';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import type { KyselyDatabase, TaskTable } from '../config/kysely.config';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  async findAll(): Promise<Task[]> {
    const tasks = await this.db.selectFrom('tasks').selectAll().execute();
    return tasks.map((task) => this.mapToTask(task));
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.db
      .selectFrom('tasks')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return task ? this.mapToTask(task) : null;
  }

  async create(task: Partial<Task>): Promise<Task> {
    const now = new Date();
    const newTask = await this.db
      .insertInto('tasks')
      .values({
        id: crypto.randomUUID(),
        title: task.title!,
        description: task.description || null,
        status: task.status || TaskStatus.TODO,
        priority: task.priority || TaskPriority.MEDIUM,
        assignee: task.assignee || null,
        due_date: task.dueDate || null,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToTask(newTask);
  }

  async update(id: string, task: Partial<Task>): Promise<Task> {
    const updateData: Partial<TaskTable> = {
      updated_at: new Date(),
    };

    if (task.title !== undefined) updateData.title = task.title;
    if (task.description !== undefined)
      updateData.description = task.description;
    if (task.status !== undefined) updateData.status = task.status;
    if (task.priority !== undefined) updateData.priority = task.priority;
    if (task.assignee !== undefined) updateData.assignee = task.assignee;
    if (task.dueDate !== undefined) updateData.due_date = task.dueDate;

    const updatedTask = await this.db
      .updateTable('tasks')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!updatedTask) {
      throw new Error('Task not found after update');
    }

    return this.mapToTask(updatedTask);
  }

  async delete(id: string): Promise<void> {
    await this.db.deleteFrom('tasks').where('id', '=', id).execute();
  }

  private mapToTask(dbTask: TaskTable): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description,
      status: dbTask.status as TaskStatus,
      priority: dbTask.priority as TaskPriority,
      assignee: dbTask.assignee,
      dueDate: dbTask.due_date,
      createdAt: dbTask.created_at,
      updatedAt: dbTask.updated_at,
    };
  }
}
