import { CreateProjectDto } from '../../../dtos/create-project.dto';

export class CreateProjectCommand {
  constructor(public readonly dto: CreateProjectDto) {}
}
