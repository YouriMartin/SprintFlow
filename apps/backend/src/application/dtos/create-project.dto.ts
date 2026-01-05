import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../../domain/entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({ example: 'SprintFlow Platform' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Agile project management and sprint planning platform',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
