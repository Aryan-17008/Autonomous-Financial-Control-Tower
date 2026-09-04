jest.mock('./auth.service', () => ({
  AuthService: jest.fn(),
}));

jest.mock('./guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn(),
}));

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from './auth.types';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new AuthController(
      authService as unknown as AuthService,
    );
  });

  describe('register', () => {
    it('should delegate registration to AuthService', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expected = {
        access_token: 'jwt-token',
        token_type: 'Bearer',
        user: {
          id: 1,
          email: dto.email,
          role: 'analyst',
        },
      };

      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should delegate login to AuthService', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expected = {
        access_token: 'jwt-token',
        token_type: 'Bearer',
        user: {
          id: 1,
          email: dto.email,
          role: 'analyst',
        },
      };

      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('profile', () => {
    it('should delegate profile lookup to AuthService', async () => {
      const user: AuthUser = {
        id: 1,
        email: 'test@example.com',
        role: 'analyst',
      };

      authService.getProfile.mockResolvedValue(user);

      const result = await controller.profile(user);

      expect(authService.getProfile).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(user);
    });
  });

  describe('delegation', () => {
    it('should call register exactly once', async () => {
      const dto: RegisterDto = {
        email: 'user@example.com',
        password: 'secure-password',
      };

      authService.register.mockResolvedValue({ success: true });

      await controller.register(dto);

      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });

    it('should call login exactly once', async () => {
      const dto: LoginDto = {
        email: 'user@example.com',
        password: 'secure-password',
      };

      authService.login.mockResolvedValue({ success: true });

      await controller.login(dto);

      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('should pass the authenticated user ID to getProfile', async () => {
      const user: AuthUser = {
        id: 42,
        email: 'user@example.com',
        role: 'analyst',
      };

      authService.getProfile.mockResolvedValue(user);

      await controller.profile(user);

      expect(authService.getProfile).toHaveBeenCalledTimes(1);
      expect(authService.getProfile).toHaveBeenCalledWith(42);
    });
  });
});