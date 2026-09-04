import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// ms-style duration literals accepted by @nestjs/jwt (e.g. "24h", "30m", "7d").
type Duration = `${number}s` | `${number}m` | `${number}h` | `${number}d`;
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '24h') as Duration;

/**
 * Auth module (Nayan's scope): register/login + JWT issuance.
 *
 * Token format: HS256 JWT, header { alg: "HS256", typ: "JWT" },
 * payload { sub, email, role, iat, exp }. Secret from env JWT_SECRET
 * (dev fallback below — override in production).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret-change-me',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
