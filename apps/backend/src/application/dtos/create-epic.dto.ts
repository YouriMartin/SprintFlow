import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EpicStatus } from '../../domain/entities/epic.entity';

export class CreateEpicDto {
  @ApiProperty({ example: 'User Authentication System' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Implement complete authentication system with OAuth and 2FA',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EpicStatus, default: EpicStatus.PLANNED })
  @IsOptional()
  @IsEnum(EpicStatus)
  status?: EpicStatus;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Start date for the epic (required for roadmap)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    example: '2024-03-31T23:59:59.000Z',
    description: 'End date for the epic (required for roadmap)',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
