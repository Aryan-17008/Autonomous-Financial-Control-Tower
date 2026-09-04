import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.users.findUnique({
      where: { email: dto.email }
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await argon2.hash(dto.password);
    const user = await this.prisma.users.create({
      data: {
        email: dto.email,
        password_hash: hashedPassword,
        role: 'analyst',
      },
    });

    return this.generateToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.password_hash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user.id, user.email, user.role);
  }

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      user: { id: userId, email, role }
    };
  }
}
