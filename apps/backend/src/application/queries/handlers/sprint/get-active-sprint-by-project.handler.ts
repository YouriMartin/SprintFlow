import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetActiveSprintByProjectQuery } from '../../impl/sprint/get-active-sprint-by-project.query';
import type { ISprintRepository } from '../../../../domain/repositories/sprint.repository.interface';
import { SPRINT_REPOSITORY } from '../../../../domain/repositories/sprint.repository.interface';
import type { Sprint } from '../../../../domain/entities/sprint.entity';

@QueryHandler(GetActiveSprintByProjectQuery)
export class GetActiveSprintByProjectHandler implements IQueryHandler<GetActiveSprintByProjectQuery> {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: ISprintRepository,
  ) {}

  async execute(query: GetActiveSprintByProjectQuery): Promise<Sprint | null> {
    return this.sprintRepository.findActiveByProjectId(query.projectId);
  }
}
