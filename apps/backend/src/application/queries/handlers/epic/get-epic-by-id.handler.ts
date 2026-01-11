import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetEpicByIdQuery } from '../../impl/epic/get-epic-by-id.query';
import type { IEpicRepository } from '../../../../domain/repositories/epic.repository.interface';
import { EPIC_REPOSITORY } from '../../../../domain/repositories/epic.repository.interface';
import type { Epic } from '../../../../domain/entities/epic.entity';

@QueryHandler(GetEpicByIdQuery)
export class GetEpicByIdHandler implements IQueryHandler<GetEpicByIdQuery> {
  constructor(
    @Inject(EPIC_REPOSITORY)
    private readonly epicRepository: IEpicRepository,
  ) {}

  async execute(query: GetEpicByIdQuery): Promise<Epic> {
    const epic = await this.epicRepository.findById(query.id);
    if (!epic) {
      throw new NotFoundException(`Epic with ID ${query.id} not found`);
    }
    return epic;
  }
}
