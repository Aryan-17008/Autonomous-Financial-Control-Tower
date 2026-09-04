import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route as public. Only meaningful if JwtAuthGuard is
 * registered globally (APP_GUARD); per-route use of the guard
 * overrides nothing.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
