import { Module } from '@nestjs/common';
import { EpicRepository } from '../infrastructure/database/epic.repository';
import { EPIC_REPOSITORY } from '../domain/repositories/epic.repository.interface';
import { EpicUseCases } from '../application/use-cases/epic.use-cases';
import { EpicController } from '../presentation/controllers/epic.controller';

@Module({
  controllers: [EpicController],
  providers: [
    EpicUseCases,
    {
      provide: EPIC_REPOSITORY,
      useClass: EpicRepository,
    },
  ],
  exports: [EpicUseCases, EPIC_REPOSITORY],
})
export class EpicModule {}
