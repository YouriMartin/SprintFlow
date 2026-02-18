import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from './user.module';
import { SetupController } from '../presentation/controllers/setup.controller';
import { GetSetupStatusHandler } from '../application/queries/handlers/setup/get-setup-status.handler';
import { SetupHandler } from '../application/commands/handlers/setup/setup.handler';

@Module({
  imports: [CqrsModule, UserModule],
  controllers: [SetupController],
  providers: [GetSetupStatusHandler, SetupHandler],
})
export class SetupModule {}
