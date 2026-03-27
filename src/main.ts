import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const API_PREFIX = 'api/v1';
const SWAGGER_PATH = 'api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(bootstrap.name);

  app.setGlobalPrefix(API_PREFIX);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
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
  await app.listen(port);

  logger.log(`Servidor corriendo en http://localhost:${port}/${API_PREFIX}`);
  logger.log(`Swagger disponible en http://localhost:${port}/${SWAGGER_PATH}`);
}
bootstrap();