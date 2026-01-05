import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
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

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ example: '2024-03-31T23:59:59.000Z', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}
