import { Inject, Injectable } from '@nestjs/common';
import { Project, ProjectStatus } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import type { KyselyDatabase, ProjectTable } from '../config/kysely.config';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  async findAll(): Promise<Project[]> {
    const projects = await this.db.selectFrom('projects').selectAll().execute();
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

  async create(
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Project> {
    const now = new Date();
    const newProject = await this.db
      .insertInto('projects')
      .values({
        id: crypto.randomUUID(),
        name: project.name,
        description: project.description || null,
        status: project.status || ProjectStatus.ACTIVE,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToProject(newProject);
  }

  async update(
    id: string,
    project: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Project | null> {
    const updateData: Partial<ProjectTable> = {
      updated_at: new Date(),
    };

    if (project.name !== undefined) updateData.name = project.name;
    if (project.description !== undefined)
      updateData.description = project.description;
    if (project.status !== undefined) updateData.status = project.status;

    const updatedProject = await this.db
      .updateTable('projects')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return updatedProject ? this.mapToProject(updatedProject) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.deleteFrom('projects').where('id', '=', id).execute();
  }

  private mapToProject(dbProject: ProjectTable): Project {
    return {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description,
      status: dbProject.status as ProjectStatus,
      createdAt: dbProject.created_at,
      updatedAt: dbProject.updated_at,
    };
  }
}
