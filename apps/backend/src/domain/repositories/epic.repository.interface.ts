import { Epic } from '../entities/epic.entity';

export interface IEpicRepository {
  findAll(): Promise<Epic[]>;
  findById(id: string): Promise<Epic | null>;
  create(epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Epic>;
  update(
    id: string,
    epic: Partial<Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Epic | null>;
  delete(id: string): Promise<void>;
}

export const EPIC_REPOSITORY = Symbol('EPIC_REPOSITORY');
