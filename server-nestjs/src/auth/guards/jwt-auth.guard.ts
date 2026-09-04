import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { JwtPayload } from '../auth.types';

/**
 * Verifies `Authorization: Bearer <jwt>` and attaches the user
 * ({ id, email, role }) to the request.
 *
 * Usage options:
 *  - per route/controller: @UseGuards(JwtAuthGuard)
 *  - global: register { provide: APP_GUARD, useClass: JwtAuthGuard } —
 *    combine with @Public() to keep selected routes open.
 *
 * Intentionally NOT registered globally yet: the transaction routes
 * are currently public. Flip it on once the mobile app sends tokens.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'];

    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('missing Bearer token');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        auth.slice('Bearer '.length),
      );
    } catch {
      throw new UnauthorizedException('invalid or expired token');
    }

    // Re-check the user still exists so deleted accounts die immediately.
    const user = await this.users.findOne({ where: { id: Number(payload.sub) } });
    if (!user) throw new UnauthorizedException('user no longer exists');

    request.user = { id: user.id, email: user.email, role: user.role };
    return true;
  }
}
