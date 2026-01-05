import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  UserStoryPriority,
  UserStoryStatus,
} from '../../domain/entities/user-story.entity';

export class CreateUserStoryDto {
  @ApiProperty({
    example:
      'As a user, I want to authenticate so that I can access my account',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'Implement JWT-based authentication system with email/password login',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: UserStoryStatus, default: UserStoryStatus.TODO })
  @IsOptional()
  @IsEnum(UserStoryStatus)
  status?: UserStoryStatus;

  @ApiProperty({ enum: UserStoryPriority, default: UserStoryPriority.MEDIUM })
  @IsOptional()
  @IsEnum(UserStoryPriority)
  priority?: UserStoryPriority;

  @ApiProperty({ example: 'john.doe@example.com', required: false })
  @IsOptional()
  @IsString()
  assignee?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsString()
  epicId?: string;
}
