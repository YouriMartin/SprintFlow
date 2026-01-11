import { CreateUserStoryDto } from '../../../dtos/create-user-story.dto';

export class CreateUserStoryCommand {
  constructor(
    public readonly dto: CreateUserStoryDto,
    public readonly userId: string,
  ) {}
}
