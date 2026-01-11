import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CodeRepositoryRepositoryImpl } from '../infrastructure/database/code-repository.repository';
import { CODE_REPOSITORY_REPOSITORY } from '../domain/repositories/code-repository.repository.interface';
import { CodeRepositoryController } from '../presentation/controllers/code-repository.controller';
import { CodeRepositoryCommandHandlers } from '../application/commands/handlers/code-repository';
import { CodeRepositoryQueryHandlers } from '../application/queries/handlers/code-repository';

@Module({
  imports: [CqrsModule],
  controllers: [CodeRepositoryController],
  providers: [
    {
      provide: CODE_REPOSITORY_REPOSITORY,
      useClass: CodeRepositoryRepositoryImpl,
    },
    ...CodeRepositoryCommandHandlers,
    ...CodeRepositoryQueryHandlers,
  ],
  exports: [CODE_REPOSITORY_REPOSITORY],
})
export class CodeRepositoryModule {}
