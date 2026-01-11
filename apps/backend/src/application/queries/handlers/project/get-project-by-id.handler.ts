import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetProjectByIdQuery } from '../../impl/project/get-project-by-id.query';
import type { IProjectRepository } from '../../../../domain/repositories/project.repository.interface';
import { PROJECT_REPOSITORY } from '../../../../domain/repositories/project.repository.interface';
import type { Project } from '../../../../domain/entities/project.entity';

@QueryHandler(GetProjectByIdQuery)
export class GetProjectByIdHandler
  implements IQueryHandler<GetProjectByIdQuery>
{
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(query: GetProjectByIdQuery): Promise<Project> {
    const project = await this.projectRepository.findById(query.id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${query.id} not found`);
    }
    return project;
  }
}
