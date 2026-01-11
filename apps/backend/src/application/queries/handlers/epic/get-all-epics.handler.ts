import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllEpicsQuery } from '../../impl/epic/get-all-epics.query';
import type { IEpicRepository } from '../../../../domain/repositories/epic.repository.interface';
import { EPIC_REPOSITORY } from '../../../../domain/repositories/epic.repository.interface';
import type { Epic } from '../../../../domain/entities/epic.entity';

@QueryHandler(GetAllEpicsQuery)
export class GetAllEpicsHandler implements IQueryHandler<GetAllEpicsQuery> {
  constructor(
    @Inject(EPIC_REPOSITORY)
    private readonly epicRepository: IEpicRepository,
  ) {}

  async execute(): Promise<Epic[]> {
    return this.epicRepository.findAll();
  }
}
