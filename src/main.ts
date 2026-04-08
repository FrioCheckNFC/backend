console.log('OS_PROCESS: Entry point reached. Cold start initiated.');
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
  console.log('BOOTSTRAP: Function started. VERSION: STABLE_FINAL_V9');
  
  // DIAGNOSTIC LOG (Password is hidden)
  console.log(`DIAGNOSTIC: DB_HOST = ${process.env.DB_HOST || 'NOT_SET'}`);
  console.log(`DIAGNOSTIC: PORT = ${process.env.PORT || 'NOT_SET (Default 3000)'}`);
  
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined!');
    throw new Error('JWT_SECRET is missing. App cannot start.');
  }

  try {
    console.log('BOOTSTRAP: Creating Nest application instance (Robust Mode)...');
    const app = await NestFactory.create(AppModule);
    console.log('BOOTSTRAP: Nest application instance created successfully.');
    
    const logger = new Logger(bootstrap.name);
    logger.log('--- FrioCheck API v1.5 Starting with Robust DB Connector ---');

    app.useGlobalFilters(new AllExceptionsFilter());
    app.setGlobalPrefix(API_PREFIX);

    // Dynamic CORS for Azure
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
      .setTitle('FrioCheck API (v1.5 - Robust Fix)')
      .setDescription('Documentación oficial (Manual Configuration)')
      .setVersion('1.5')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(SWAGGER_PATH, app, document);

    const port = Number(process.env.PORT ?? 3000);
    console.log(`BOOTSTRAP: Attempting to listen on port ${port}...`);
    await app.listen(port, '0.0.0.0');

    logger.log(`Servidor corriendo en el puerto ${port}`);
    console.log(`BOOTSTRAP: SERVER IS READY AND LISTENING ON PORT ${port}`);
  } catch (error) {
    console.error('BOOTSTRAP ERROR: Fatal crash during startup.');
    console.error(error);
    process.exit(1);
  }
}
bootstrap();
