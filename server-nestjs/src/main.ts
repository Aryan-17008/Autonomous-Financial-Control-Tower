import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validates @Body() DTOs (class-validator) and strips unknown fields.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(
    `Financial Control Tower API listening on http://localhost:${port}`,
  );
}