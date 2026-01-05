import { Module } from '@nestjs/common';
import { CodeRepositoryRepositoryImpl } from '../infrastructure/database/code-repository.repository';
import { CODE_REPOSITORY_REPOSITORY } from '../domain/repositories/code-repository.repository.interface';
import { CodeRepositoryUseCases } from '../application/use-cases/code-repository.use-cases';
import { CodeRepositoryController } from '../presentation/controllers/code-repository.controller';

@Module({
  controllers: [CodeRepositoryController],
  providers: [
    CodeRepositoryUseCases,
    {
      provide: CODE_REPOSITORY_REPOSITORY,
      useClass: CodeRepositoryRepositoryImpl,
    },
  ],
  exports: [CodeRepositoryUseCases, CODE_REPOSITORY_REPOSITORY],
})
export class CodeRepositoryModule {}
