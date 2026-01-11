import { UpdateEpicDto } from '../../../dtos/update-epic.dto';

export class UpdateEpicCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateEpicDto,
    public readonly userId: string,
  ) {}
}
