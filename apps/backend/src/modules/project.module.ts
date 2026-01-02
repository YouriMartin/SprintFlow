import { Module } from '@nestjs/common';
import { ProjectRepositoryImpl } from '../infrastructure/database/project.repository';
import { PROJECT_REPOSITORY } from '../domain/repositories/project.repository.interface';
import { ProjectUseCases } from '../application/use-cases/project.use-cases';
import { ProjectController } from '../presentation/controllers/project.controller';

@Module({
  controllers: [ProjectController],
  providers: [
    ProjectUseCases,
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectRepositoryImpl,
    },
  ],
  exports: [ProjectUseCases, PROJECT_REPOSITORY],
})
export class ProjectModule {}
