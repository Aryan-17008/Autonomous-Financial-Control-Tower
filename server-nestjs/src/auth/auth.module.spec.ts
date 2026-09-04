jest.mock('@nestjs/jwt', () => ({
  JwtModule: {
    register: jest.fn((options) => ({
      module: 'JwtModule',
      options,
    })),
  },
}));

jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forFeature: jest.fn((entities) => ({
      module: 'TypeOrmModule',
      entities,
    })),
  },
  InjectRepository: jest.fn(() => {
    return () => {};
  }),
}));

import 'reflect-metadata';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MODULE_METADATA } from '@nestjs/common/constants';

describe('AuthModule', () => {
  it('should be defined', () => {
    expect(AuthModule).toBeDefined();
  });

  it('should register AuthController', () => {
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      AuthModule,
    );

    expect(controllers).toContain(AuthController);
  });

  it('should register AuthService and JwtAuthGuard as providers', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      AuthModule,
    );

    expect(providers).toContain(AuthService);
    expect(providers).toContain(JwtAuthGuard);
  });

  it('should export AuthService, JwtModule and JwtAuthGuard', () => {
    const exports = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      AuthModule,
    );

    expect(exports).toContain(AuthService);
    expect(exports).toContain(JwtAuthGuard);

    expect(exports).toContain(
      jest.requireMock('@nestjs/jwt').JwtModule,
    );
  });

  it('should configure TypeOrmModule with User entity', () => {
    const typeorm = jest.requireMock('@nestjs/typeorm');

    expect(typeorm.TypeOrmModule.forFeature).toHaveBeenCalledWith(
      expect.any(Array),
    );

    const entities =
      typeorm.TypeOrmModule.forFeature.mock.calls[0][0];

    expect(entities).toContainEqual(
      expect.any(Function),
    );
  });

  it('should configure JwtModule', () => {
    const jwt = jest.requireMock('@nestjs/jwt');

    expect(jwt.JwtModule.register).toHaveBeenCalled();

    expect(jwt.JwtModule.register).toHaveBeenCalledWith(
      expect.objectContaining({
        secret: expect.any(String),
        signOptions: expect.objectContaining({
          expiresIn: expect.any(String),
        }),
      }),
    );
  });
});