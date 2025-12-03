import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../domain/entities/task.entity';
import { TaskRepository } from '../infrastructure/database/task.repository';
import { TASK_REPOSITORY } from '../domain/repositories/task.repository.interface';
import { TaskUseCases } from '../application/use-cases/task.use-cases';
import { TaskController } from '../presentation/controllers/task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
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
