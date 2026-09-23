import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from workspace root
dotenv.config({ path: path.join(process.cwd(), '../../.env') });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
