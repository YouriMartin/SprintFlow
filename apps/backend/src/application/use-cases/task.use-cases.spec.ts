import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TaskUseCases } from './task.use-cases';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/repositories/task.repository.interface';
import { Task, TaskStatus, TaskPriority } from '../../domain/entities/task.entity';

describe('TaskUseCases', () => {
  let taskUseCases: TaskUseCases;
  let taskRepository: jest.Mocked<ITaskRepository>;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assignee: 'test@example.com',
    dueDate: new Date('2024-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository: jest.Mocked<ITaskRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskUseCases,
        {
          provide: TASK_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    taskUseCases = module.get<TaskUseCases>(TaskUseCases);
    taskRepository = module.get(TASK_REPOSITORY);
  });

  it('should be defined', () => {
    expect(taskUseCases).toBeDefined();
  });

  describe('getAllTasks', () => {
    it('should return an array of tasks', async () => {
      const tasks = [mockTask];
      taskRepository.findAll.mockResolvedValue(tasks);

      const result = await taskUseCases.getAllTasks();

      expect(result).toEqual(tasks);
      expect(taskRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      taskRepository.findById.mockResolvedValue(mockTask);

      const result = await taskUseCases.getTaskById('1');

      expect(result).toEqual(mockTask);
      expect(taskRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if task not found', async () => {
      taskRepository.findById.mockResolvedValue(null);

      await expect(taskUseCases.getTaskById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'New Description',
      };
      taskRepository.create.mockResolvedValue(mockTask);

      const result = await taskUseCases.createTask(createTaskDto);

      expect(result).toEqual(mockTask);
      expect(taskRepository.create).toHaveBeenCalledWith(createTaskDto);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updateTaskDto = { title: 'Updated Task' };
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue({ ...mockTask, ...updateTaskDto });

      const result = await taskUseCases.updateTask('1', updateTaskDto);

      expect(result.title).toEqual('Updated Task');
      expect(taskRepository.update).toHaveBeenCalledWith('1', updateTaskDto);
    });

    it('should throw NotFoundException if task not found', async () => {
      taskRepository.findById.mockResolvedValue(null);

      await expect(
        taskUseCases.updateTask('999', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.delete.mockResolvedValue();

      await taskUseCases.deleteTask('1');

      expect(taskRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if task not found', async () => {
      taskRepository.findById.mockResolvedValue(null);

      await expect(taskUseCases.deleteTask('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
