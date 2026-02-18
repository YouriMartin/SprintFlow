import { CreateSetupDto } from '../../../dtos/create-setup.dto';

export class SetupCommand {
  constructor(public readonly dto: CreateSetupDto) {}
}
