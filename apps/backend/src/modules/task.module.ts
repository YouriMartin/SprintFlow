import { Module } from '@nestjs/common';
import { TaskRepository } from '../infrastructure/database/task.repository';
import { TASK_REPOSITORY } from '../domain/repositories/task.repository.interface';
import { TaskUseCases } from '../application/use-cases/task.use-cases';
import { TaskController } from '../presentation/controllers/task.controller';
import { CodeRepositoryModule } from './code-repository.module';

@Module({
  imports: [CodeRepositoryModule],
  controllers: [TaskController],
  providers: [
    TaskUseCases,
    {
      provide: TASK_REPOSITORY,
      useClass: TaskRepository,
    },
  ],
  exports: [TaskUseCases],
})
export class TaskModule {}
