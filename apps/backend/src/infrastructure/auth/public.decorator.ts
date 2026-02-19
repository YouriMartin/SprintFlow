import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as publicly accessible, bypassing the global JwtAuthGuard.
 * Apply this decorator to controllers or individual route handlers that should
 * not require authentication (e.g. login, setup endpoints).
 *
 * @example
 * ```typescript
 * @Public()
 * @Post('login')
 * login(@Body() dto: LoginDto) { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
