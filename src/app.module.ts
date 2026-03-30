import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { VisitsModule } from './modules/visits/visits.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    // Lee las variables del archivo .env y las hace accesibles en toda la app
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexion a PostgreSQL usando las variables del .env
    // forRootAsync espera a que ConfigModule cargue antes de conectar
    // synchronize:true crea las tablas automaticamente en desarrollo
    // En produccion se reemplaza por migraciones
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        // SSL requerido para Azure PostgreSQL
        ssl: config.get('DB_HOST', '').includes('azure.com')
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),

    AuthModule,
    TenantsModule,
    UsersModule,
    AssetsModule,
    VisitsModule,
    TicketsModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
