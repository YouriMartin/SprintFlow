import {Inject, Injectable} from '@nestjs/common';
import {CodeRepository, RepositoryType,} from '../../domain/entities/code-repository.entity';
import {CodeRepositoryRepository} from '../../domain/repositories/code-repository.repository.interface';
import type {CodeRepositoryTable, KyselyDatabase} from '../config/kysely.config';

@Injectable()
export class CodeRepositoryRepositoryImpl implements CodeRepositoryRepository {
  constructor(
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  async findAll(): Promise<CodeRepository[]> {
    const codeRepositories = await this.db
      .selectFrom('code_repositories')
      .selectAll()
      .execute();
    return codeRepositories.map((codeRepository) => this.mapToCodeRepository(codeRepository));
  }

  async findById(id: string): Promise<CodeRepository | null> {
    const codeRepository = await this.db
      .selectFrom('code_repositories')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return codeRepository ? this.mapToCodeRepository(codeRepository) : null;
  }

  async create(codeRepository: Omit<CodeRepository, 'id' | 'createdAt' | 'updatedAt'>): Promise<CodeRepository> {
    const now = new Date();
    const newCodeRepository = await this.db
      .insertInto('code_repositories')
      .values({
        id: crypto.randomUUID(),
        name: codeRepository.name,
        description: codeRepository.description || null,
        repository_url: codeRepository.repositoryUrl,
        repository_type: codeRepository.repositoryType,
        repository_id: codeRepository.repositoryId || null,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToCodeRepository(newCodeRepository);
  }

  async update(id: string, codeRepository: Partial<Omit<CodeRepository, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CodeRepository | null> {
    const updateData: Partial<CodeRepositoryTable> = {
      updated_at: new Date(),
    };

    if (codeRepository.name !== undefined) updateData.name = codeRepository.name;
    if (codeRepository.description !== undefined) updateData.description = codeRepository.description;
    if (codeRepository.repositoryUrl !== undefined) updateData.repository_url = codeRepository.repositoryUrl;
    if (codeRepository.repositoryType !== undefined) updateData.repository_type = codeRepository.repositoryType;
    if (codeRepository.repositoryId !== undefined) updateData.repository_id = codeRepository.repositoryId;

    const updatedCodeRepository = await this.db
      .updateTable('code_repositories')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return updatedCodeRepository ? this.mapToCodeRepository(updatedCodeRepository) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('code_repositories')
      .where('id', '=', id)
      .executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  async findByUserStoryId(userStoryId: string): Promise<CodeRepository[]> {
    const codeRepositories = await this.db
      .selectFrom('code_repositories')
      .innerJoin('user_story_code_repositories', 'user_story_code_repositories.code_repository_id', 'code_repositories.id')
      .selectAll('code_repositories')
      .where('user_story_code_repositories.user_story_id', '=', userStoryId)
      .execute();

    return codeRepositories.map((codeRepository) => this.mapToCodeRepository(codeRepository));
  }

  private mapToCodeRepository(dbCodeRepository: CodeRepositoryTable): CodeRepository {
    return {
      id: dbCodeRepository.id,
      name: dbCodeRepository.name,
      description: dbCodeRepository.description,
      repositoryUrl: dbCodeRepository.repository_url,
      repositoryType: dbCodeRepository.repository_type as RepositoryType,
      repositoryId: dbCodeRepository.repository_id,
      createdAt: dbCodeRepository.created_at,
      updatedAt: dbCodeRepository.updated_at,
    };
  }
}
