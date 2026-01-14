import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetSprintByIdQuery } from '../../impl/sprint/get-sprint-by-id.query';
import type { ISprintRepository } from '../../../../domain/repositories/sprint.repository.interface';
import { SPRINT_REPOSITORY } from '../../../../domain/repositories/sprint.repository.interface';
import type { Sprint } from '../../../../domain/entities/sprint.entity';

@QueryHandler(GetSprintByIdQuery)
export class GetSprintByIdHandler implements IQueryHandler<GetSprintByIdQuery> {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: ISprintRepository,
  ) {}

  async execute(query: GetSprintByIdQuery): Promise<Sprint> {
    const sprint = await this.sprintRepository.findById(query.id);
    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${query.id} not found`);
    }
    return sprint;
  }
}
