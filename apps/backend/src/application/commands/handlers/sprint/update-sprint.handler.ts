import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateSprintCommand } from '../../impl/sprint/update-sprint.command';
import type { ISprintRepository } from '../../../../domain/repositories/sprint.repository.interface';
import { SPRINT_REPOSITORY } from '../../../../domain/repositories/sprint.repository.interface';
import type { Sprint } from '../../../../domain/entities/sprint.entity';

@CommandHandler(UpdateSprintCommand)
export class UpdateSprintHandler implements ICommandHandler<UpdateSprintCommand> {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: ISprintRepository,
  ) {}

  async execute(command: UpdateSprintCommand): Promise<Sprint> {
    const { id, dto, userId } = command;

    const sprint = await this.sprintRepository.findById(id);
    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    const updateData: Partial<
      Omit<
        Sprint,
        | 'id'
        | 'createdAt'
        | 'updatedAt'
        | 'createdBy'
        | 'deletedBy'
        | 'deletedAt'
      >
    > = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.goal !== undefined) updateData.goal = dto.goal ?? null;
    if (dto.sprintNumber !== undefined)
      updateData.sprintNumber = dto.sprintNumber;
    if (dto.startDate !== undefined) updateData.startDate = dto.startDate;
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.velocity !== undefined) updateData.velocity = dto.velocity ?? null;
    if (dto.capacity !== undefined) updateData.capacity = dto.capacity ?? null;
    if (dto.projectId !== undefined)
      updateData.projectId = dto.projectId ?? null;

    updateData.updatedBy = userId;

    const updated = await this.sprintRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(
        `Sprint with ID ${id} not found after update`,
      );
    }

    return updated;
  }
}
