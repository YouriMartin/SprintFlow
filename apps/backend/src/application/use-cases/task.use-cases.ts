import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { TASK_REPOSITORY } from '../../domain/repositories/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';

@Injectable()
export class TaskUseCases {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.taskRepository.create(createTaskDto);
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.taskRepository.update(id, updateTaskDto);
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    await this.taskRepository.delete(id);
  }
}
