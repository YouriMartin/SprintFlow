import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';

@Injectable()
export class ProjectUseCases {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
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
      status: createProjectDto.status!,
    });
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const updateData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>> =
      {};
    if (updateProjectDto.name !== undefined)
      updateData.name = updateProjectDto.name;
    if (updateProjectDto.description !== undefined)
      updateData.description = updateProjectDto.description ?? null;
    if (updateProjectDto.status !== undefined)
      updateData.status = updateProjectDto.status;

    const updated = await this.projectRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(
        `Project with ID ${id} not found after update`,
      );
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
}
