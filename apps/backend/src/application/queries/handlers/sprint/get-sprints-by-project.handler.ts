import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSprintsByProjectQuery } from '../../impl/sprint/get-sprints-by-project.query';
import type { ISprintRepository } from '../../../../domain/repositories/sprint.repository.interface';
import { SPRINT_REPOSITORY } from '../../../../domain/repositories/sprint.repository.interface';
import type { Sprint } from '../../../../domain/entities/sprint.entity';

@QueryHandler(GetSprintsByProjectQuery)
export class GetSprintsByProjectHandler implements IQueryHandler<GetSprintsByProjectQuery> {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: ISprintRepository,
  ) {}

  async execute(query: GetSprintsByProjectQuery): Promise<Sprint[]> {
    return this.sprintRepository.findByProjectId(query.projectId);
  }
}
