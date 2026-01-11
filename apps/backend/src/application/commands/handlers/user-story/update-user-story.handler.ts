import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateUserStoryCommand } from '../../impl/user-story/update-user-story.command';
import type { IUserStoryRepository } from '../../../../domain/repositories/user-story.repository.interface';
import { USER_STORY_REPOSITORY } from '../../../../domain/repositories/user-story.repository.interface';
import type { UserStory } from '../../../../domain/entities/user-story.entity';

@CommandHandler(UpdateUserStoryCommand)
export class UpdateUserStoryHandler
  implements ICommandHandler<UpdateUserStoryCommand>
{
  constructor(
    @Inject(USER_STORY_REPOSITORY)
    private readonly userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(command: UpdateUserStoryCommand): Promise<UserStory> {
    const { id, dto, userId } = command;

    const userStory = await this.userStoryRepository.findById(id);
    if (!userStory) {
      throw new NotFoundException(`UserStory with ID ${id} not found`);
    }

    return this.userStoryRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }
}
