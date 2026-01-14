import { CreateSprintDto } from '../../../dtos/create-sprint.dto';

export class CreateSprintCommand {
  constructor(
    public readonly dto: CreateSprintDto,
    public readonly userId: string,
  ) {}
}
