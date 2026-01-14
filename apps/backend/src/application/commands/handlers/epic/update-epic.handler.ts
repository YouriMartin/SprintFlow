import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateEpicCommand } from '../../impl/epic/update-epic.command';
import type { IEpicRepository } from '../../../../domain/repositories/epic.repository.interface';
import { EPIC_REPOSITORY } from '../../../../domain/repositories/epic.repository.interface';
import type { Epic } from '../../../../domain/entities/epic.entity';

@CommandHandler(UpdateEpicCommand)
export class UpdateEpicHandler implements ICommandHandler<UpdateEpicCommand> {
  constructor(
    @Inject(EPIC_REPOSITORY)
    private readonly epicRepository: IEpicRepository,
  ) {}

  async execute(command: UpdateEpicCommand): Promise<Epic> {
    const { id, dto, userId } = command;

    const epic = await this.epicRepository.findById(id);
    if (!epic) {
      throw new NotFoundException(`Epic with ID ${id} not found`);
    }

    const updateData: Partial<
      Omit<
        Epic,
        'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'deletedBy' | 'deletedAt'
      >
    > = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined)
      updateData.description = dto.description ?? null;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.startDate !== undefined) updateData.startDate = dto.startDate;
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate;
    if (dto.projectId !== undefined)
      updateData.projectId = dto.projectId ?? null;
    if (dto.isVisibleInRoadmap !== undefined)
      updateData.isVisibleInRoadmap = dto.isVisibleInRoadmap;

    updateData.updatedBy = userId;

    const updated = await this.epicRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Epic with ID ${id} not found after update`);
    }

    return updated;
  }
}
