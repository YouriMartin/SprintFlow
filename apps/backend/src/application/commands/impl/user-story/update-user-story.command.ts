import { UpdateUserStoryDto } from '../../../dtos/update-user-story.dto';

export class UpdateUserStoryCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateUserStoryDto,
    public readonly userId: string,
  ) {}
}
