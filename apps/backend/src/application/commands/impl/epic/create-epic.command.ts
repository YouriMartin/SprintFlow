import { CreateEpicDto } from '../../../dtos/create-epic.dto';

export class CreateEpicCommand {
  constructor(
    public readonly dto: CreateEpicDto,
    public readonly userId: string,
  ) {}
}
