import { Sprint } from '../entities/sprint.entity';

export interface ISprintRepository {
  findAll(): Promise<Sprint[]>;
  findById(id: string): Promise<Sprint | null>;
  findByProjectId(projectId: string): Promise<Sprint[]>;
  findActiveByProjectId(projectId: string): Promise<Sprint | null>;
  create(sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'deletedBy' | 'deletedAt'>): Promise<Sprint>;
  update(id: string, sprint: Partial<Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'deletedBy' | 'deletedAt'>>): Promise<Sprint | null>;
  delete(id: string, userId: string): Promise<void>;
}

export const SPRINT_REPOSITORY = Symbol('SPRINT_REPOSITORY');
