import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SprintRepository } from '../infrastructure/database/sprint.repository';
import { SPRINT_REPOSITORY } from '../domain/repositories/sprint.repository.interface';
import { SprintController } from '../presentation/controllers/sprint.controller';
import { SprintCommandHandlers } from '../application/commands/handlers/sprint';
import { SprintQueryHandlers } from '../application/queries/handlers/sprint';

@Module({
  imports: [CqrsModule],
  controllers: [SprintController],
  providers: [
    {
      provide: SPRINT_REPOSITORY,
      useClass: SprintRepository,
    },
    ...SprintCommandHandlers,
    ...SprintQueryHandlers,
  ],
  exports: [SPRINT_REPOSITORY],
})
export class SprintModule {}
