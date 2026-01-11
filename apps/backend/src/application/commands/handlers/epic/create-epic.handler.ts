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

  async execute(command: CreateEpicCommand): Promise<Epic> {
    const { dto, userId } = command;

    return this.epicRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status!,
      startDate: dto.startDate,
      endDate: dto.endDate,
      projectId: dto.projectId ?? null,
      createdBy: userId,
    });
  }
}
