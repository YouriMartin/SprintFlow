import { UpdateProjectDto } from '../../../dtos/update-project.dto';

export class UpdateProjectCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateProjectDto,
  ) {}
}
