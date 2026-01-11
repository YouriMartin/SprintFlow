import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteEpicCommand } from '../../impl/epic/delete-epic.command';
import type { IEpicRepository } from '../../../../domain/repositories/epic.repository.interface';
import { EPIC_REPOSITORY } from '../../../../domain/repositories/epic.repository.interface';

@CommandHandler(DeleteEpicCommand)
export class DeleteEpicHandler implements ICommandHandler<DeleteEpicCommand> {
  constructor(
    @Inject(EPIC_REPOSITORY)
    private readonly epicRepository: IEpicRepository,
  ) {}

  async execute(command: DeleteEpicCommand): Promise<void> {
    const { id, userId } = command;

    const epic = await this.epicRepository.findById(id);
    if (!epic) {
      throw new NotFoundException(`Epic with ID ${id} not found`);
    }

    await this.epicRepository.delete(id, userId);
  }
}
