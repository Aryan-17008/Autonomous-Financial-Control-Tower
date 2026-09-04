import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

import type { JwtService } from '@nestjs/jwt';
import type { Repository } from 'typeorm';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../../entities/user.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  let jwtService: {
    verifyAsync: jest.Mock;
  };

  let usersRepository: {
    findOne: jest.Mock;
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'analyst',
  } as User;

  const createContext = (authorization?: string) => {
    const request: {
      headers: { authorization?: string };
      user?: unknown;
    } = {
      headers: {},
    };

    if (authorization !== undefined) {
      request.headers.authorization = authorization;
    }

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    return { context, request };
  };

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    };

    usersRepository = {
      findOne: jest.fn(),
    };

    guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
      usersRepository as unknown as Repository<User>,
    );
  });

  describe('canActivate', () => {
    it('should reject when Authorization header is missing', async () => {
      const { context } = createContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('missing Bearer token'),
      );

      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should reject when Authorization header is not a Bearer token', async () => {
      const { context } = createContext('Basic some-token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('missing Bearer token'),
      );

      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should reject when Bearer token is empty', async () => {
      const { context } = createContext('Bearer ');

      jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('invalid or expired token'),
      );
    });

    it('should reject when JWT verification fails', async () => {
      const { context } = createContext('Bearer invalid-token');

      jwtService.verifyAsync.mockRejectedValue(
        new Error('invalid or expired token'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('invalid or expired token'),
      );

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
      expect(usersRepository.findOne).not.toHaveBeenCalled();
    });

    it('should reject when the token is expired', async () => {
      const { context } = createContext('Bearer expired-token');

      jwtService.verifyAsync.mockRejectedValue(
        new Error('jwt expired'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('invalid or expired token'),
      );
    });

    it('should reject when the authenticated user no longer exists', async () => {
      const { context } = createContext('Bearer valid-token');

      jwtService.verifyAsync.mockResolvedValue({
        sub: '1',
        email: 'test@example.com',
        role: 'analyst',
      });

      usersRepository.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('user no longer exists'),
      );

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should allow a valid token when the user exists', async () => {
      const { context } = createContext('Bearer valid-token');

      jwtService.verifyAsync.mockResolvedValue({
        sub: '1',
        email: 'test@example.com',
        role: 'analyst',
      });

      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(guard.canActivate(context)).resolves.toBe(true);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should attach the authenticated user to request.user', async () => {
      const { context, request } = createContext('Bearer valid-token');

      jwtService.verifyAsync.mockResolvedValue({
        sub: '1',
        email: 'test@example.com',
        role: 'analyst',
      });

      usersRepository.findOne.mockResolvedValue(mockUser);

      await guard.canActivate(context);

      expect(request.user).toEqual({
        id: 1,
        email: 'test@example.com',
        role: 'analyst',
      });
    });

    it('should convert the JWT subject to a numeric user ID', async () => {
      const { context } = createContext('Bearer valid-token');

      jwtService.verifyAsync.mockResolvedValue({
        sub: '42',
        email: 'user@example.com',
        role: 'admin',
      });

      usersRepository.findOne.mockResolvedValue({
        id: 42,
        email: 'user@example.com',
        role: 'admin',
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 42 },
      });
    });
  });
});