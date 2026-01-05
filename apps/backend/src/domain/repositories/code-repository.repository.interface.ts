import {CodeRepository} from '../entities/code-repository.entity';

export interface CodeRepositoryRepository {
  findAll(): Promise<CodeRepository[]>;
  findById(id: string): Promise<CodeRepository | null>;
  create(codeRepository: Omit<CodeRepository, 'id' | 'createdAt' | 'updatedAt'>): Promise<CodeRepository>;
  update(id: string, codeRepository: Partial<Omit<CodeRepository, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CodeRepository | null>;
  delete(id: string): Promise<boolean>;
  findByUserStoryId(userStoryId: string): Promise<CodeRepository[]>;
}

export const CODE_REPOSITORY_REPOSITORY = Symbol('CodeRepositoryRepository');
