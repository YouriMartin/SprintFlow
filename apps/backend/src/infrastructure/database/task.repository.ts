import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async findById(id: string): Promise<Task | null> {
    return this.taskRepository.findOne({ where: { id } });
  }

  async create(task: Partial<Task>): Promise<Task> {
    const newTask = this.taskRepository.create(task);
    return this.taskRepository.save(newTask);
  }

  async update(id: string, task: Partial<Task>): Promise<Task> {
    await this.taskRepository.update(id, task);
    const updatedTask = await this.findById(id);
    if (!updatedTask) {
      throw new Error('Task not found after update');
    }
    return updatedTask;
  }

  async delete(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }
}
