import 'reflect-metadata';
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

// EXPLICT ENTITY IMPORTS FOR AZURE STABILITY
import { Attachment } from './modules/attachments/entities/attachment.entity';
import { PasswordReset } from './modules/auth/entities/password-reset.entity';
import { InventoryItem } from './modules/inventory/entities/inventory.entity';
import { Kpi } from './modules/kpis/entities/kpi.entity';
import { Machine } from './modules/machines/entities/machine.entity';
import { Merma } from './modules/mermas/entities/merma.entity';
import { NfcTag } from './modules/nfc-tags/entities/nfc-tag.entity';
import { Sale } from './modules/sales/entities/sale.entity';
import { Sector } from './modules/sectors/entities/sector.entity';
import { SyncQueue } from './modules/sync-queue/entities/sync-queue.entity';
import { Tenant } from './modules/tenants/entities/tenant.entity';
import { Ticket } from './modules/tickets/entities/ticket.entity';
import { User } from './modules/users/entities/user.entity';
import { Visit } from './modules/visits/entities/visit.entity';
import { WorkOrder } from './modules/work-orders/entities/work-order.entity';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 60 },
      { name: 'long', ttl: 3600000, limit: 300 },
    ]),

    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        // MANUAL MODE: Explicitly list all entities to avoid Azure scanning failures
        entities: [
          Attachment, PasswordReset, InventoryItem, Kpi, Machine, 
          Merma, NfcTag, Sale, Sector, SyncQueue, 
          Tenant, Ticket, User, Visit, WorkOrder
        ],
        autoLoadEntities: false, 
        synchronize: false,
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
