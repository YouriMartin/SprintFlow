import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteUserStoryCommand } from '../../impl/user-story/delete-user-story.command';
import type { IUserStoryRepository } from '../../../../domain/repositories/user-story.repository.interface';
import { USER_STORY_REPOSITORY } from '../../../../domain/repositories/user-story.repository.interface';

@CommandHandler(DeleteUserStoryCommand)
export class DeleteUserStoryHandler implements ICommandHandler<DeleteUserStoryCommand> {
  constructor(
    @Inject(USER_STORY_REPOSITORY)
    private readonly userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(command: DeleteUserStoryCommand): Promise<void> {
    const { id, userId } = command;

    const userStory = await this.userStoryRepository.findById(id);
    if (!userStory) {
      throw new NotFoundException(`UserStory with ID ${id} not found`);
    }

    await this.userStoryRepository.delete(id, userId);
  }
}
