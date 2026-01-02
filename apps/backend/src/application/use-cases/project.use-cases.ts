import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ProjectRepository } from '../../domain/repositories/project.repository.interface';
import { PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import type { KyselyDatabase } from '../../infrastructure/config/kysely.config';

@Injectable()
export class ProjectUseCases {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  async getAllProjects(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }

  async getProjectById(id: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectRepository.create({
      name: createProjectDto.name,
      description: createProjectDto.description ?? null,
      repositoryUrl: createProjectDto.repositoryUrl,
      repositoryType: createProjectDto.repositoryType,
      repositoryId: createProjectDto.repositoryId ?? null,
    });
  }

  async updateProject(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const updateData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>> = {};
    if (updateProjectDto.name !== undefined) updateData.name = updateProjectDto.name;
    if (updateProjectDto.description !== undefined) updateData.description = updateProjectDto.description ?? null;
    if (updateProjectDto.repositoryUrl !== undefined) updateData.repositoryUrl = updateProjectDto.repositoryUrl;
    if (updateProjectDto.repositoryType !== undefined) updateData.repositoryType = updateProjectDto.repositoryType;
    if (updateProjectDto.repositoryId !== undefined) updateData.repositoryId = updateProjectDto.repositoryId ?? null;

    const updated = await this.projectRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Project with ID ${id} not found after update`);
    }
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    await this.projectRepository.delete(id);
  }

  async getProjectsByTaskId(taskId: string): Promise<Project[]> {
    return this.projectRepository.findByTaskId(taskId);
  }

  async linkTaskToProject(taskId: string, projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const existing = await this.db
      .selectFrom('task_projects')
      .selectAll()
      .where('task_id', '=', taskId)
      .where('project_id', '=', projectId)
      .executeTakeFirst();

    if (!existing) {
      await this.db
        .insertInto('task_projects')
        .values({
          task_id: taskId,
          project_id: projectId,
          created_at: new Date(),
        })
        .execute();
    }
  }

  async unlinkTaskFromProject(taskId: string, projectId: string): Promise<void> {
    await this.db
      .deleteFrom('task_projects')
      .where('task_id', '=', taskId)
      .where('project_id', '=', projectId)
      .execute();
  }

  async linkTaskToProjects(taskId: string, projectIds: string[]): Promise<void> {
    for (const projectId of projectIds) {
      await this.linkTaskToProject(taskId, projectId);
    }
  }

  async unlinkTaskFromAllProjects(taskId: string): Promise<void> {
    await this.db
      .deleteFrom('task_projects')
      .where('task_id', '=', taskId)
      .execute();
  }
}
