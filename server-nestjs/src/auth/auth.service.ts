import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthUser, JwtPayload } from './auth.types';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Create a new account. Passwords are hashed with bcrypt (cost 10);
   * the plaintext password is never stored or returned.
   */
  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('email already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.save(
      this.users.create({
        email: dto.email,
        password_hash,
        role: 'analyst',
        created_at: new Date().toISOString(),
      }),
    );

    return this.buildTokenResponse(this.toAuthUser(user));
  }

  /**
   * Verify credentials and issue a token. Uses the same error for
   * unknown email and wrong password to avoid account enumeration.
   */
  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    const passwordOk = user
      ? await bcrypt.compare(dto.password, user.password_hash)
      : false;

    if (!user || !passwordOk) {
      throw new UnauthorizedException('invalid email or password');
    }

    return this.buildTokenResponse(this.toAuthUser(user));
  }

  /** Look up the user referenced by a verified token payload. */
  async getProfile(userId: number): Promise<AuthUser> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('user no longer exists');
    return this.toAuthUser(user);
  }

  private toAuthUser(user: User): AuthUser {
    return { id: user.id, email: user.email, role: user.role };
  }

  private buildTokenResponse(user: AuthUser) {
    const payload: JwtPayload = {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      user,
    };
  }
}
