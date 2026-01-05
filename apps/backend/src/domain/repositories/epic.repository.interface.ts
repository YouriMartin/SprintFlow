import { Epic } from '../entities/epic.entity';

export interface IEpicRepository {
  findAll(): Promise<Epic[]>;
  findById(id: string): Promise<Epic | null>;
  create(epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'deletedBy' | 'deletedAt'>): Promise<Epic>;
  update(
    id: string,
    epic: Partial<Omit<Epic, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'deletedBy' | 'deletedAt'>>,
  ): Promise<Epic | null>;
  delete(id: string, userId: string): Promise<void>;
}

export const EPIC_REPOSITORY = Symbol('EPIC_REPOSITORY');
