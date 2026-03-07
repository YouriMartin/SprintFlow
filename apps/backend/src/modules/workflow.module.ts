import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkflowRepository } from '../infrastructure/database/workflow.repository';
import { WORKFLOW_REPOSITORY } from '../domain/repositories/workflow.repository.interface';
import { WorkflowController } from '../presentation/controllers/workflow.controller';
import { WorkflowCommandHandlers } from '../application/commands/handlers/workflow';
import { WorkflowQueryHandlers } from '../application/queries/handlers/workflow';

@Module({
  imports: [CqrsModule],
  controllers: [WorkflowController],
  providers: [
    {
      provide: WORKFLOW_REPOSITORY,
      useClass: WorkflowRepository,
    },
    ...WorkflowCommandHandlers,
    ...WorkflowQueryHandlers,
  ],
  exports: [WORKFLOW_REPOSITORY],
})
export class WorkflowModule {}
