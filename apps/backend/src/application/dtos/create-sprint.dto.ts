import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SprintStatus } from '../../domain/entities/sprint.entity';

export class CreateSprintDto {
  @ApiProperty({ example: 'Sprint 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Complete user authentication module',
    required: false,
  })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({ example: 1, description: 'Sprint number in sequence' })
  @IsInt()
  @Min(1)
  sprintNumber: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ example: '2024-01-14T23:59:59.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({ enum: SprintStatus, default: SprintStatus.PLANNED })
  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @ApiProperty({
    example: 21,
    description: 'Team velocity (story points per sprint)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  velocity?: number;

  @ApiProperty({
    example: 25,
    description: 'Team capacity (available story points)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}
