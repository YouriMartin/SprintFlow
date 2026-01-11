import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllProjectsQuery } from '../../impl/project/get-all-projects.query';
import type { IProjectRepository } from '../../../../domain/repositories/project.repository.interface';
import { PROJECT_REPOSITORY } from '../../../../domain/repositories/project.repository.interface';
import type { Project } from '../../../../domain/entities/project.entity';

@QueryHandler(GetAllProjectsQuery)
export class GetAllProjectsHandler
  implements IQueryHandler<GetAllProjectsQuery>
{
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }
}
