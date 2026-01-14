import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SprintStatus } from '../../domain/entities/sprint.entity';

export class UpdateSprintDto {
  @ApiProperty({ example: 'Sprint 1', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Complete user authentication module',
    required: false,
  })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  sprintNumber?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ example: '2024-01-14T23:59:59.000Z', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({ enum: SprintStatus, required: false })
  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @ApiProperty({ example: 21, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  velocity?: number;

  @ApiProperty({ example: 25, required: false })
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
