import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Backward compatibility: map /auth/* to /api/v1/auth/*.
  app.use((req, _res, next) => {
    if (req.url.startsWith('/auth/')) {
      req.url = `/api/v1${req.url}`;
    }
    next();
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());

  // Listen on all interfaces so the API is reachable from other devices in the network.
  const port = Number(process.env.PORT || 3001);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
