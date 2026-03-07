import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkflowStatusDto {
  @ApiPropertyOptional({ description: 'Human-readable label shown in the UI' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiPropertyOptional({
    description: 'Phase groups this status belongs to — a status can appear in multiple views',
    example: ['DEVELOPMENT', 'DEPLOYMENT'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupNames?: string[];

  @ApiPropertyOptional({ description: 'Sort position within the group' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'CSS colour string, e.g. #6b7280' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({ description: 'Whether new stories start with this status' })
  @IsOptional()
  @IsBoolean()
  isInitial?: boolean;

  @ApiPropertyOptional({ description: 'Whether this is a final/terminal state' })
  @IsOptional()
  @IsBoolean()
  isTerminal?: boolean;

  @ApiPropertyOptional({ description: 'Canvas X position for the visual editor' })
  @IsOptional()
  @IsNumber()
  posX?: number;

  @ApiPropertyOptional({ description: 'Canvas Y position for the visual editor' })
  @IsOptional()
  @IsNumber()
  posY?: number;
}
