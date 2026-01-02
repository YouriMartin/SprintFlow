import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RepositoryType } from '../../domain/entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({ example: 'SprintFlow' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Sprint planning and task management tool', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://github.com/username/sprintflow' })
  @IsUrl()
  repositoryUrl: string;

  @ApiProperty({ enum: RepositoryType, example: RepositoryType.GITHUB })
  @IsEnum(RepositoryType)
  repositoryType: RepositoryType;

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  repositoryId?: string;
}
