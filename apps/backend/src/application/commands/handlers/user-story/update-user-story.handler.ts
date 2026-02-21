import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateUserStoryCommand } from '../../impl/user-story/update-user-story.command';
import type { IUserStoryRepository } from '../../../../domain/repositories/user-story.repository.interface';
import { USER_STORY_REPOSITORY } from '../../../../domain/repositories/user-story.repository.interface';
import type { UserStory } from '../../../../domain/entities/user-story.entity';
import { AUTO_TRANSITIONS } from '../../../../domain/entities/user-story.entity';

@CommandHandler(UpdateUserStoryCommand)
export class UpdateUserStoryHandler implements ICommandHandler<UpdateUserStoryCommand> {
  constructor(
    @Inject(USER_STORY_REPOSITORY)
    private readonly userStoryRepository: IUserStoryRepository,
  ) {}

  /**
   * Updates a user story and applies automatic cross-group status transitions.
   *
   * Automatic transitions:
   * - DEV_DONE    → TO_TEST    (story enters QA queue)
   * - TEST_PASSED → TO_DEPLOY  (story enters deployment queue)
   * - TEST_FAILED → TODO       (story returns to development sprint)
   *
   * @param command - UpdateUserStoryCommand with id, dto and userId
   * @returns The updated user story (after any automatic transition)
   * @throws NotFoundException if the story does not exist
   */
  async execute(command: UpdateUserStoryCommand): Promise<UserStory> {
    const { id, dto, userId } = command;

    const userStory = await this.userStoryRepository.findById(id);
    if (!userStory) {
      throw new NotFoundException(`UserStory with ID ${id} not found`);
    }

    const updated = await this.userStoryRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });

    // Apply automatic cross-group transition if the new status triggers one
    if (dto.status && AUTO_TRANSITIONS[dto.status]) {
      const autoStatus = AUTO_TRANSITIONS[dto.status]!;
      return this.userStoryRepository.update(id, {
        status: autoStatus,
        updatedBy: userId,
      });
    }

    return updated;
  }
}
