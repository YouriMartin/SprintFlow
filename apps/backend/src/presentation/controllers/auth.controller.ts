import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LoginDto } from '../../application/dtos/login.dto';
import { LoginCommand } from '../../application/commands/impl/auth/login.command';
import { RefreshCommand } from '../../application/commands/impl/auth/refresh.command';
import { LogoutCommand } from '../../application/commands/impl/auth/logout.command';
import type { LoginResult } from '../../application/commands/handlers/auth/login.handler';
import type { RefreshResult } from '../../application/commands/handlers/auth/refresh.handler';
import { Public } from '../../infrastructure/auth/public.decorator';
import type { JwtPayload } from '../../infrastructure/auth/jwt.strategy';

const COOKIE_NAME = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 3600 * 1000,
  path: '/',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Authenticates a user with email and password.
   * Sets an HTTP-only cookie with the refresh token.
   * @param dto - Login credentials
   * @param res - Express response (used to set cookie)
   * @returns Access token and public user fields
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns access token and user info' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; user: LoginResult['user'] }> {
    const result = await this.commandBus.execute<LoginCommand, LoginResult>(
      new LoginCommand(dto),
    );

    res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

    return { accessToken: result.accessToken, user: result.user };
  }

  /**
   * Issues a new access token using the HTTP-only refresh token cookie.
   * The old refresh token is revoked and a new one is set (token rotation).
   * @param req - Express request (used to read cookie)
   * @param res - Express response (used to set new cookie)
   * @returns New access token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh the access token using the cookie' })
  @ApiResponse({ status: 200, description: 'Returns new access token' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const rawToken: string | undefined = req.cookies?.[COOKIE_NAME];
    if (!rawToken) {
      throw new UnauthorizedException('No refresh token cookie present');
    }

    const result = await this.commandBus.execute<RefreshCommand, RefreshResult>(
      new RefreshCommand(rawToken),
    );

    res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

    return { accessToken: result.accessToken };
  }

  /**
   * Logs out the current user by revoking the refresh token and clearing the cookie.
   * @param req - Express request (used to read cookie)
   * @param res - Express response (used to clear cookie)
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and revoke the refresh token' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const rawToken: string | undefined = req.cookies?.[COOKIE_NAME];

    await this.commandBus.execute(new LogoutCommand(rawToken ?? ''));

    res.clearCookie(COOKIE_NAME, { path: '/' });
  }

  /**
   * Returns the currently authenticated user's profile from the JWT payload.
   * @param req - Express request containing the validated JWT payload on req.user
   * @returns The JWT payload (sub, email, role)
   */
  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns the current user info' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  me(@Req() req: Request): JwtPayload {
    return req.user as JwtPayload;
  }
}
