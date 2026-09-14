import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { configureRuntime, isVercel, uploadDir } from './runtime';

configureRuntime();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });
  const origins = (process.env.WEB_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  app.enableCors({
    origin: isVercel() ? true : origins.length === 1 ? origins[0] : origins,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  if (!isVercel()) {
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  } else {
    app.useStaticAssets(uploadDir(), { prefix: '/uploads/' });
  }
  await app.listen(process.env.PORT || 4000);
  console.log(`SafeNest API on http://localhost:${process.env.PORT || 4000}`);
}

bootstrap().catch((error) => {
  console.error('SafeNest failed to start', error);
  throw error;
});
