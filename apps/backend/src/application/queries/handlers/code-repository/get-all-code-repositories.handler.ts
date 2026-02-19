import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllCodeRepositoriesQuery } from '../../impl/code-repository/get-all-code-repositories.query';
import type { CodeRepositoryRepository } from '../../../../domain/repositories/code-repository.repository.interface';
import { CODE_REPOSITORY_REPOSITORY } from '../../../../domain/repositories/code-repository.repository.interface';
import type { CodeRepository } from '../../../../domain/entities/code-repository.entity';

@QueryHandler(GetAllCodeRepositoriesQuery)
export class GetAllCodeRepositoriesHandler implements IQueryHandler<GetAllCodeRepositoriesQuery> {
  constructor(
    @Inject(CODE_REPOSITORY_REPOSITORY)
    private readonly codeRepositoryRepository: CodeRepositoryRepository,
  ) {}

  async execute(): Promise<CodeRepository[]> {
    return this.codeRepositoryRepository.findAll();
  }
}
