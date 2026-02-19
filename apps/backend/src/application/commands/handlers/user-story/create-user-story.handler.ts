import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserStoryCommand } from '../../impl/user-story/create-user-story.command';
import type { IUserStoryRepository } from '../../../../domain/repositories/user-story.repository.interface';
import { USER_STORY_REPOSITORY } from '../../../../domain/repositories/user-story.repository.interface';
import type { UserStory } from '../../../../domain/entities/user-story.entity';

@CommandHandler(CreateUserStoryCommand)
export class CreateUserStoryHandler implements ICommandHandler<CreateUserStoryCommand> {
  constructor(
    @Inject(USER_STORY_REPOSITORY)
    private readonly userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(command: CreateUserStoryCommand): Promise<UserStory> {
    const { dto, userId } = command;

    return this.userStoryRepository.create({
      ...dto,
      createdBy: userId,
    });
  }
}
