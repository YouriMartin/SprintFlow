import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EpicRepository } from '../infrastructure/database/epic.repository';
import { EPIC_REPOSITORY } from '../domain/repositories/epic.repository.interface';
import { EpicController } from '../presentation/controllers/epic.controller';
import { EpicCommandHandlers } from '../application/commands/handlers/epic';
import { EpicQueryHandlers } from '../application/queries/handlers/epic';

@Module({
  imports: [CqrsModule],
  controllers: [EpicController],
  providers: [
    {
      provide: EPIC_REPOSITORY,
      useClass: EpicRepository,
    },
    ...EpicCommandHandlers,
    ...EpicQueryHandlers,
  ],
  exports: [EPIC_REPOSITORY],
})
export class EpicModule {}
