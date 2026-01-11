import { UpdateCodeRepositoryDto } from '../../../dtos/update-code-repository.dto';

export class UpdateCodeRepositoryCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateCodeRepositoryDto,
  ) {}
}
