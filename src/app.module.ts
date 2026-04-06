import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { MachinesModule } from './modules/machines/machines.module';
import { VisitsModule } from './modules/visits/visits.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { SectorsModule } from './modules/sectors/sectors.module';
import { SalesModule } from './modules/sales/sales.module';
import { MermasModule } from './modules/mermas/mermas.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { KpisModule } from './modules/kpis/kpis.module';
import { NfcTagsModule } from './modules/nfc-tags/nfc-tags.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { SyncQueueModule } from './modules/sync-queue/sync-queue.module';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    // Rate limiting para prevenir ataques de fuerza bruta
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 10, // 10 requests por segundo
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minuto
        limit: 60, // 60 requests por minuto
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hora
        limit: 300, // 300 requests por hora
      },
    ]),

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
    MachinesModule,
    VisitsModule,
    TicketsModule,
    AttachmentsModule,
    SectorsModule,
    SalesModule,
    MermasModule,
    InventoryModule,
    KpisModule,
    NfcTagsModule,
    WorkOrdersModule,
    SyncQueueModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
