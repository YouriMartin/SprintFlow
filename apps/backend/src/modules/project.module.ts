import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProjectRepository } from '../infrastructure/database/project.repository';
import { PROJECT_REPOSITORY } from '../domain/repositories/project.repository.interface';
import { ProjectController } from '../presentation/controllers/project.controller';
import { ProjectCommandHandlers } from '../application/commands/handlers/project';
import { ProjectQueryHandlers } from '../application/queries/handlers/project';

@Module({
  imports: [CqrsModule],
  controllers: [ProjectController],
  providers: [
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectRepository,
    },
    ...ProjectCommandHandlers,
    ...ProjectQueryHandlers,
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
