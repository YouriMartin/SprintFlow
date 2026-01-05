import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import type {CodeRepositoryRepository} from '../../domain/repositories/code-repository.repository.interface';
import {CODE_REPOSITORY_REPOSITORY} from '../../domain/repositories/code-repository.repository.interface';
import {CodeRepository} from '../../domain/entities/code-repository.entity';
import {CreateCodeRepositoryDto} from '../dtos/create-code-repository.dto';
import {UpdateCodeRepositoryDto} from '../dtos/update-code-repository.dto';
import type {KyselyDatabase} from '../../infrastructure/config/kysely.config';

@Injectable()
export class CodeRepositoryUseCases {
  constructor(
    @Inject(CODE_REPOSITORY_REPOSITORY)
    private readonly codeRepositoryRepository: CodeRepositoryRepository,
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  async getAllCodeRepositories(): Promise<CodeRepository[]> {
    return this.codeRepositoryRepository.findAll();
  }

  async getCodeRepositoryById(id: string): Promise<CodeRepository> {
    const codeRepository = await this.codeRepositoryRepository.findById(id);
    if (!codeRepository) {
      throw new NotFoundException(`CodeRepository with ID ${id} not found`);
    }
    return codeRepository;
  }

  async createCodeRepository(createCodeRepositoryDto: CreateCodeRepositoryDto): Promise<CodeRepository> {
    return this.codeRepositoryRepository.create({
      name: createCodeRepositoryDto.name,
      description: createCodeRepositoryDto.description ?? null,
      repositoryUrl: createCodeRepositoryDto.repositoryUrl,
      repositoryType: createCodeRepositoryDto.repositoryType,
      repositoryId: createCodeRepositoryDto.repositoryId ?? null,
    });
  }

  async updateCodeRepository(id: string, updateCodeRepositoryDto: UpdateCodeRepositoryDto): Promise<CodeRepository> {
    const codeRepository = await this.codeRepositoryRepository.findById(id);
    if (!codeRepository) {
      throw new NotFoundException(`CodeRepository with ID ${id} not found`);
    }

    const updateData: Partial<Omit<CodeRepository, 'id' | 'createdAt' | 'updatedAt'>> = {};
    if (updateCodeRepositoryDto.name !== undefined) updateData.name = updateCodeRepositoryDto.name;
    if (updateCodeRepositoryDto.description !== undefined) updateData.description = updateCodeRepositoryDto.description ?? null;
    if (updateCodeRepositoryDto.repositoryUrl !== undefined) updateData.repositoryUrl = updateCodeRepositoryDto.repositoryUrl;
    if (updateCodeRepositoryDto.repositoryType !== undefined) updateData.repositoryType = updateCodeRepositoryDto.repositoryType;
    if (updateCodeRepositoryDto.repositoryId !== undefined) updateData.repositoryId = updateCodeRepositoryDto.repositoryId ?? null;

    const updated = await this.codeRepositoryRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`CodeRepository with ID ${id} not found after update`);
    }
    return updated;
  }

  async deleteCodeRepository(id: string): Promise<void> {
    const codeRepository = await this.codeRepositoryRepository.findById(id);
    if (!codeRepository) {
      throw new NotFoundException(`CodeRepository with ID ${id} not found`);
    }
    await this.codeRepositoryRepository.delete(id);
  }

  async getCodeRepositoriesByTaskId(taskId: string): Promise<CodeRepository[]> {
    return this.codeRepositoryRepository.findByTaskId(taskId);
  }

  async linkTaskToCodeRepository(taskId: string, codeRepositoryId: string): Promise<void> {
    const codeRepository = await this.codeRepositoryRepository.findById(codeRepositoryId);
    if (!codeRepository) {
      throw new NotFoundException(`CodeRepository with ID ${codeRepositoryId} not found`);
    }

    const existing = await this.db
      .selectFrom('task_code_repositories')
      .selectAll()
      .where('task_id', '=', taskId)
      .where('code_repository_id', '=', codeRepositoryId)
      .executeTakeFirst();

    if (!existing) {
      await this.db
        .insertInto('task_code_repositories')
        .values({
          task_id: taskId,
          code_repository_id: codeRepositoryId,
          created_at: new Date(),
        })
        .execute();
    }
  }

  async unlinkTaskFromCodeRepository(taskId: string, codeRepositoryId: string): Promise<void> {
    await this.db
      .deleteFrom('task_code_repositories')
      .where('task_id', '=', taskId)
      .where('code_repository_id', '=', codeRepositoryId)
      .execute();
  }

  async linkTaskToCodeRepositories(taskId: string, codeRepositoryIds: string[]): Promise<void> {
    for (const codeRepositoryId of codeRepositoryIds) {
      await this.linkTaskToCodeRepository(taskId, codeRepositoryId);
    }
  }

  async unlinkTaskFromAllCodeRepositories(taskId: string): Promise<void> {
    await this.db
      .deleteFrom('task_code_repositories')
      .where('task_id', '=', taskId)
      .execute();
  }
}
