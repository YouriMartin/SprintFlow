import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateSprintCommand } from '../../impl/sprint/create-sprint.command';
import type { ISprintRepository } from '../../../../domain/repositories/sprint.repository.interface';
import { SPRINT_REPOSITORY } from '../../../../domain/repositories/sprint.repository.interface';
import type { Sprint } from '../../../../domain/entities/sprint.entity';
import { SprintStatus } from '../../../../domain/entities/sprint.entity';

@CommandHandler(CreateSprintCommand)
export class CreateSprintHandler implements ICommandHandler<CreateSprintCommand> {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: ISprintRepository,
  ) {}

  async execute(command: CreateSprintCommand): Promise<Sprint> {
    const { dto, userId } = command;

    return this.sprintRepository.create({
      name: dto.name,
      goal: dto.goal ?? null,
      sprintNumber: dto.sprintNumber,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: dto.status ?? SprintStatus.PLANNED,
      velocity: dto.velocity ?? null,
      capacity: dto.capacity ?? null,
      projectId: dto.projectId ?? null,
      createdBy: userId,
    });
  }
}
