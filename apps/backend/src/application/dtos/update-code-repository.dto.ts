import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RepositoryType } from '../../domain/entities/code-repository.entity';

export class UpdateCodeRepositoryDto {
  @ApiProperty({ example: 'SprintFlow', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Sprint planning and task management tool', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://github.com/username/sprintflow', required: false })
  @IsOptional()
  @IsUrl()
  repositoryUrl?: string;

  @ApiProperty({ enum: RepositoryType, example: RepositoryType.GITHUB, required: false })
  @IsOptional()
  @IsEnum(RepositoryType)
  repositoryType?: RepositoryType;

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  repositoryId?: string;
}
