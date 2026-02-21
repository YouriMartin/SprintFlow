import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateEpicCommand } from '../../impl/epic/create-epic.command';
import type { IEpicRepository } from '../../../../domain/repositories/epic.repository.interface';
import { EPIC_REPOSITORY } from '../../../../domain/repositories/epic.repository.interface';
import type { Epic } from '../../../../domain/entities/epic.entity';

@CommandHandler(CreateEpicCommand)
export class CreateEpicHandler implements ICommandHandler<CreateEpicCommand> {
  constructor(
    @Inject(EPIC_REPOSITORY)
    private readonly epicRepository: IEpicRepository,
  ) {}

  /**
   * Converts a YYYY-MM string to a Date set to the first day of that month (UTC).
   * @param yearMonth - Month string in YYYY-MM format
   * @returns Date object representing the first day of the given month
   */
  private toFirstOfMonth(yearMonth: string): Date {
    return new Date(`${yearMonth}-01T00:00:00.000Z`);
  }

  async execute(command: CreateEpicCommand): Promise<Epic> {
    const { dto, userId } = command;

    return this.epicRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status!,
      startDate: this.toFirstOfMonth(dto.startDate),
      endDate: this.toFirstOfMonth(dto.endDate),
      projectId: dto.projectId ?? null,
      isVisibleInRoadmap: dto.isVisibleInRoadmap ?? true,
      createdBy: userId,
    });
  }
}
