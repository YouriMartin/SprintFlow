import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllSprintsQuery } from '../../impl/sprint/get-all-sprints.query';
import type { ISprintRepository } from '../../../../domain/repositories/sprint.repository.interface';
import { SPRINT_REPOSITORY } from '../../../../domain/repositories/sprint.repository.interface';
import type { Sprint } from '../../../../domain/entities/sprint.entity';

@QueryHandler(GetAllSprintsQuery)
export class GetAllSprintsHandler implements IQueryHandler<GetAllSprintsQuery> {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: ISprintRepository,
  ) {}

  async execute(): Promise<Sprint[]> {
    return this.sprintRepository.findAll();
  }
}
