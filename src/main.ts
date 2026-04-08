import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as express from 'express';

const API_PREFIX = 'api/v1';
const SWAGGER_PATH = 'api';

async function bootstrap() {
  console.log('BOOTSTRAP: Process started. VERSION: ARCHITECTURE_V4_FIX');
  
  // FIX #7: JWT_SECRET debe estar configurado antes de arrancar
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables!');
    throw new Error(
      'JWT_SECRET no está configurado. Define JWT_SECRET en tu .env o en la configuración de Azure antes de arrancar.',
    );
  }

  try {
    console.log('BOOTSTRAP: Creating Nest application instance...');
    const app = await NestFactory.create(AppModule);
    console.log('BOOTSTRAP: Nest application instance created successfully.');
    
    const logger = new Logger(bootstrap.name);
    logger.log('--- FrioCheck API v1.3 Starting with Decoupled Architecture ---');

  // Simple request logging for NFC/machines endpoints to aid debugging
  const requestLogger = (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith(`/${API_PREFIX}/machines`) || req.path.startsWith(`/${API_PREFIX}/nfc-tags`)) {
      logger.debug(`Incoming request ${req.method} ${req.originalUrl} body=${JSON.stringify(req.body || {})}`);
    }
    next();
  };
  app.use(requestLogger);

  // Global exception filter to log stack traces and request context
  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix(API_PREFIX);

  // FIX #1: CORS restringido — solo los orígenes permitidos pueden hacer requests
  // Configura ALLOWED_ORIGINS en tu .env (coma-separados). En dev acepta localhost.
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // FIX #9: ValidationPipe más estricto — rechaza campos desconocidos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // lanza error si vienen campos extra
      transform: true,            // convierte tipos automáticamente (ej: string->number)
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FrioCheck API (v1.2 - Deploy Fix)')
    .setDescription('Documentación oficial para los equipos de Móvil y Web')
    .setVersion('1.2')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(SWAGGER_PATH, app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  logger.log(`Servidor corriendo en http://localhost:${port}/${API_PREFIX}`);
  logger.log(`Swagger disponible en http://localhost:${port}/${SWAGGER_PATH}`);
  } catch (error) {
    console.error('BOOTSTRAP ERROR: Failed to start the application.');
    console.error(error);
    process.exit(1);
  }
}
bootstrap();
