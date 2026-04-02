import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const API_PREFIX = 'api/v1';
const SWAGGER_PATH = 'api';

async function bootstrap() {
  // FIX #7: JWT_SECRET debe estar configurado antes de arrancar
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET no está configurado. Define JWT_SECRET en tu .env antes de arrancar.',
    );
  }

  const app = await NestFactory.create(AppModule);
  const logger = new Logger(bootstrap.name);

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
    .setTitle('FrioCheck API')
    .setDescription('Documentación oficial para los equipos de Móvil y Web')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(SWAGGER_PATH, app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  logger.log(`Servidor corriendo en http://localhost:${port}/${API_PREFIX}`);
  logger.log(`Swagger disponible en http://localhost:${port}/${SWAGGER_PATH}`);
}
bootstrap();
