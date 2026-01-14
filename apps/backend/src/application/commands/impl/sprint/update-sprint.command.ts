import { UpdateSprintDto } from '../../../dtos/update-sprint.dto';

export class UpdateSprintCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateSprintDto,
    public readonly userId: string,
  ) {}
}
