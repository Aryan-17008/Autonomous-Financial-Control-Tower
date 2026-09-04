import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const users = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AuthService(
      users as any,
      jwtService as any,
    );
  });

  describe('register', () => {
    it('should register a new user and return a token response', async () => {
      users.findOne.mockResolvedValue(null);

      const createdUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed-password',
        role: 'analyst',
        created_at: new Date().toISOString(),
      };

      users.create.mockReturnValue(createdUser);
      users.save.mockResolvedValue(createdUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(users.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          role: 'analyst',
        }),
      );

      expect(users.save).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();

      expect(result).toEqual({
        access_token: 'jwt-token',
        token_type: 'Bearer',
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'analyst',
        },
      });
    });

    it('should reject registration when email already exists', async () => {
      users.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(users.save).not.toHaveBeenCalled();
    });

    it('should hash the password before saving', async () => {
      users.findOne.mockResolvedValue(null);

      const createdUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed-password',
        role: 'analyst',
        created_at: new Date().toISOString(),
      };

      users.create.mockReturnValue(createdUser);
      users.save.mockResolvedValue(createdUser);
      jwtService.sign.mockReturnValue('jwt-token');

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password_hash: 'hashed-password',
        }),
      );

    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      users.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed-password',
        role: 'analyst',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        token_type: 'Bearer',
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'analyst',
        },
      });

      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should reject login when email does not exist', async () => {
      users.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should reject login when password is incorrect', async () => {
      users.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed-password',
        role: 'analyst',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return the authenticated user profile', async () => {
      users.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed-password',
        role: 'analyst',
      });

      const result = await service.getProfile(1);

      expect(users.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        role: 'analyst',
      });
    });

    it('should reject profile lookup when user no longer exists', async () => {
      users.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});