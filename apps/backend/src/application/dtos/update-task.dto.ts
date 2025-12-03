import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../../domain/entities/task.entity';

export class UpdateTaskDto {
  @ApiProperty({ example: 'Implement user authentication', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Add JWT-based authentication system', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority, required: false })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ example: 'john.doe@example.com', required: false })
  @IsOptional()
  @IsString()
  assignee?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;
}
