import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCodeRepositoryByIdQuery } from '../../impl/code-repository/get-code-repository-by-id.query';
import type { CodeRepositoryRepository } from '../../../../domain/repositories/code-repository.repository.interface';
import { CODE_REPOSITORY_REPOSITORY } from '../../../../domain/repositories/code-repository.repository.interface';
import type { CodeRepository } from '../../../../domain/entities/code-repository.entity';

@QueryHandler(GetCodeRepositoryByIdQuery)
export class GetCodeRepositoryByIdHandler implements IQueryHandler<GetCodeRepositoryByIdQuery> {
  constructor(
    @Inject(CODE_REPOSITORY_REPOSITORY)
    private readonly codeRepositoryRepository: CodeRepositoryRepository,
  ) {}

  async execute(query: GetCodeRepositoryByIdQuery): Promise<CodeRepository> {
    const codeRepository = await this.codeRepositoryRepository.findById(
      query.id,
    );
    if (!codeRepository) {
      throw new NotFoundException(
        `CodeRepository with ID ${query.id} not found`,
      );
    }
    return codeRepository;
  }
}
