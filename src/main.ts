import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as express from 'express';

const API_PREFIX = 'api/v1';
const SWAGGER_PATH = 'api';

async function bootstrap() {
  console.log('BOOTSTRAP: Process started. VERSION: STABLE_EXPLICIT_V7');
  
  // DIAGNOSTIC LOG (Password is hidden by not being logged)
  console.log(`DIAGNOSTIC: DB_HOST = ${process.env.DB_HOST || 'NOT_SET'}`);
  
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables!');
    throw new Error(
      'JWT_SECRET no está configurado. Define JWT_SECRET en tu .env o en la configuración de Azure antes de arrancar.',
    );
  }

  try {
    console.log('BOOTSTRAP: Creating Nest application instance (Explicit Entities Mode)...');
    const app = await NestFactory.create(AppModule);
    console.log('BOOTSTRAP: Nest application instance created successfully.');
    
    const logger = new Logger(bootstrap.name);
    logger.log('--- FrioCheck API v1.4 Starting with Explicit Entity Registry ---');

    const requestLogger = (req: express.Request, _res: express.Response, next: express.NextFunction) => {
      if (req.path.startsWith(`/${API_PREFIX}/machines`) || req.path.startsWith(`/${API_PREFIX}/nfc-tags`)) {
        logger.debug(`Incoming request ${req.method} ${req.originalUrl} body=${JSON.stringify(req.body || {})}`);
      }
      next();
    };
    app.use(requestLogger);

    app.useGlobalFilters(new AllExceptionsFilter());
    app.setGlobalPrefix(API_PREFIX);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173'];

    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const swaggerConfig = new DocumentBuilder()
      .setTitle('FrioCheck API (v1.4 - Explicit Fix)')
      .setDescription('Documentación oficial (Manual Entity Configuration)')
      .setVersion('1.4')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(SWAGGER_PATH, app, document);

    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port, '0.0.0.0');

    logger.log(`Servidor corriendo en http://localhost:${port}/${API_PREFIX}`);
    logger.log(`Swagger disponible en http://localhost:${port}/${SWAGGER_PATH}`);
  } catch (error) {
    console.error('BOOTSTRAP ERROR: Failed to start the application in Explicit Mode.');
    console.error(error);
    process.exit(1);
  }
}
bootstrap();
