import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteSprintCommand } from '../../impl/sprint/delete-sprint.command';
import type { ISprintRepository } from '../../../../domain/repositories/sprint.repository.interface';
import { SPRINT_REPOSITORY } from '../../../../domain/repositories/sprint.repository.interface';

@CommandHandler(DeleteSprintCommand)
export class DeleteSprintHandler implements ICommandHandler<DeleteSprintCommand> {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: ISprintRepository,
  ) {}

  async execute(command: DeleteSprintCommand): Promise<void> {
    const { id, userId } = command;

    const sprint = await this.sprintRepository.findById(id);
    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    await this.sprintRepository.delete(id, userId);
  }
}
