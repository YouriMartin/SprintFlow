import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TaskUseCases } from '../../application/use-cases/task.use-cases';
import { CreateTaskDto } from '../../application/dtos/create-task.dto';
import { UpdateTaskDto } from '../../application/dtos/update-task.dto';
import { Task } from '../../domain/entities/task.entity';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskUseCases: TaskUseCases) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'Return all tasks' })
  async findAll(): Promise<Task[]> {
    return this.taskUseCases.getAllTasks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiResponse({ status: 200, description: 'Return the task' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.taskUseCases.getTaskById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.taskUseCases.createTask(createTaskDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.taskUseCases.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.taskUseCases.deleteTask(id);
  }
}
