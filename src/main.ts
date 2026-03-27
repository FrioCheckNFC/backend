import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 1. Prefijo global: Todas tus rutas empezaran con /api/v1
  app.setGlobalPrefix('api/v1');

  // 2. Habilitar CORS: permite que web y movil se conecten desde otro dominio/puerto
  app.enableCors();

  // 3. Validacion automatica: rechaza requests que no cumplan las reglas del DTO
  // whitelist:true elimina campos que no esten definidos en el DTO (seguridad)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 3. Configuración de Swagger: El "contrato" para el de Móvil
  const config = new DocumentBuilder()
    .setTitle('FrioCheck API')
    .setDescription('Documentación oficial para los equipos de Móvil y Web')
    .setVersion('1.0')
    .addBearerAuth() // Para cuando usemos tokens JWT
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  // 4. Arrancar en el puerto 3000
  await app.listen(3000);
  
  logger.log(' Servidor corriendo en http://localhost:3000/api/v1');
  logger.log(' Swagger disponible en http://localhost:3000/api');
}
bootstrap();