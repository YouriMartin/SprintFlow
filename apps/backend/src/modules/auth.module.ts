import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '../presentation/controllers/auth.controller';
import { JwtStrategy } from '../infrastructure/auth/jwt.strategy';
import { RefreshTokenRepository } from '../infrastructure/auth/refresh-token.repository';
import { REFRESH_TOKEN_REPOSITORY } from '../domain/repositories/refresh-token.repository.interface';
import { AuthCommandHandlers } from '../application/commands/handlers/auth';
import { UserModule } from './user.module';

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('app.jwtAccessSecret') ||
          'change-me-in-production-access',
        signOptions: { expiresIn: '15m' },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenRepository,
    },
    ...AuthCommandHandlers,
  ],
})
export class AuthModule {}
