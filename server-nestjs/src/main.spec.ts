jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('./app.module', () => ({
  AppModule: class AppModule {},
}));

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { bootstrap } from './main';

describe('bootstrap', () => {
  const mockApp = {
    useGlobalPipes: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    delete process.env.PORT;
  });

  it('should create the Nest application with AppModule', async () => {
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('should configure the global ValidationPipe', async () => {
    await bootstrap();

    expect(mockApp.useGlobalPipes).toHaveBeenCalledTimes(1);

    const pipe = mockApp.useGlobalPipes.mock.calls[0][0];

    expect(pipe).toBeInstanceOf(ValidationPipe);
  });

  it('should listen on port 3000 by default', async () => {
    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });

  it('should listen on the configured PORT', async () => {
    process.env.PORT = '4000';

    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith(4000);
  });

  it('should complete successfully after starting the application', async () => {
    await expect(bootstrap()).resolves.toBeUndefined();

    expect(mockApp.listen).toHaveBeenCalledTimes(1);
  });
});