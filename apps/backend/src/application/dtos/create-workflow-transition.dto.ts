import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkflowTransitionDto {
  @ApiProperty({ description: 'UUID of the source status' })
  @IsUUID()
  fromStatusId: string;

  @ApiProperty({ description: 'UUID of the target status' })
  @IsUUID()
  toStatusId: string;
}
