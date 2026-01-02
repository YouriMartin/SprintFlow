import { Project } from '../entities/project.entity';

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  update(id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project | null>;
  delete(id: string): Promise<boolean>;
  findByTaskId(taskId: string): Promise<Project[]>;
}

export const PROJECT_REPOSITORY = Symbol('ProjectRepository');
