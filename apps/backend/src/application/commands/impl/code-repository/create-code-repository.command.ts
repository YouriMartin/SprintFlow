import { CreateCodeRepositoryDto } from '../../../dtos/create-code-repository.dto';

export class CreateCodeRepositoryCommand {
  constructor(public readonly dto: CreateCodeRepositoryDto) {}
}
