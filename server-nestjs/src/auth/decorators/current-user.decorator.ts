import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator for the authenticated user attached by JwtAuthGuard.
 * Usage: someRoute(@CurrentUser() user: AuthUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
