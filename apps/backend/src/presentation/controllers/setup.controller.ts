import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetSetupStatusQuery } from '../../application/queries/impl/setup/get-setup-status.query';
import { SetupCommand } from '../../application/commands/impl/setup/setup.command';
import { CreateSetupDto } from '../../application/dtos/create-setup.dto';

@ApiTags('setup')
@Controller('setup')
export class SetupController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Check if initial setup is required' })
  @Get('status')
  getStatus(): Promise<{ required: boolean }> {
    return this.queryBus.execute(new GetSetupStatusQuery());
  }

  @ApiOperation({ summary: 'Create the first superadmin user' })
  @Post()
  setup(@Body() dto: CreateSetupDto) {
    return this.commandBus.execute(new SetupCommand(dto));
  }
}
