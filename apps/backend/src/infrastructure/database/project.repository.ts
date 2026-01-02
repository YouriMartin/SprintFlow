import { Injectable, Inject } from '@nestjs/common';
import {
  Project,
  RepositoryType,
} from '../../domain/entities/project.entity';
import { ProjectRepository } from '../../domain/repositories/project.repository.interface';
import type { KyselyDatabase, ProjectTable } from '../config/kysely.config';

@Injectable()
export class ProjectRepositoryImpl implements ProjectRepository {
  constructor(
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  async findAll(): Promise<Project[]> {
    const projects = await this.db
      .selectFrom('projects')
      .selectAll()
      .execute();
    return projects.map((project) => this.mapToProject(project));
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.db
      .selectFrom('projects')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return project ? this.mapToProject(project) : null;
  }

  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const now = new Date();
    const newProject = await this.db
      .insertInto('projects')
      .values({
        id: crypto.randomUUID(),
        name: project.name,
        description: project.description || null,
        repository_url: project.repositoryUrl,
        repository_type: project.repositoryType,
        repository_id: project.repositoryId || null,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToProject(newProject);
  }

  async update(id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project | null> {
    const updateData: Partial<ProjectTable> = {
      updated_at: new Date(),
    };

    if (project.name !== undefined) updateData.name = project.name;
    if (project.description !== undefined) updateData.description = project.description;
    if (project.repositoryUrl !== undefined) updateData.repository_url = project.repositoryUrl;
    if (project.repositoryType !== undefined) updateData.repository_type = project.repositoryType;
    if (project.repositoryId !== undefined) updateData.repository_id = project.repositoryId;

    const updatedProject = await this.db
      .updateTable('projects')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return updatedProject ? this.mapToProject(updatedProject) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('projects')
      .where('id', '=', id)
      .executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  async findByTaskId(taskId: string): Promise<Project[]> {
    const projects = await this.db
      .selectFrom('projects')
      .innerJoin('task_projects', 'task_projects.project_id', 'projects.id')
      .selectAll('projects')
      .where('task_projects.task_id', '=', taskId)
      .execute();

    return projects.map((project) => this.mapToProject(project));
  }

  private mapToProject(dbProject: ProjectTable): Project {
    return {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description,
      repositoryUrl: dbProject.repository_url,
      repositoryType: dbProject.repository_type as RepositoryType,
      repositoryId: dbProject.repository_id,
      createdAt: dbProject.created_at,
      updatedAt: dbProject.updated_at,
    };
  }
}
