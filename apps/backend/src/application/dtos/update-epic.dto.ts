import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EpicStatus } from '../../domain/entities/epic.entity';

export class UpdateEpicDto {
  @ApiProperty({ example: 'User Authentication System', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Implement complete authentication system with OAuth and 2FA',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EpicStatus, required: false })
  @IsOptional()
  @IsEnum(EpicStatus)
  status?: EpicStatus;

  @ApiProperty({ example: '2024-01', description: 'Start month in YYYY-MM format', required: false })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'startDate must be in YYYY-MM format' })
  startDate?: string;

  @ApiProperty({ example: '2024-03', description: 'End month in YYYY-MM format', required: false })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'endDate must be in YYYY-MM format' })
  endDate?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the epic is visible in the roadmap',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isVisibleInRoadmap?: boolean;
}
