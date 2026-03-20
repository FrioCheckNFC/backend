import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { MachinesModule } from './machines/machines.module';
import { NfcTagsModule } from './nfc-tags/nfc-tags.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { VisitsModule } from './visits/visits.module';
import { TicketsModule } from './tickets/tickets.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { SyncQueueModule } from './sync-queue/sync-queue.module';

// Entities
import { Tenant } from './tenants/entities/tenant.entity';
import { User } from './users/entities/user.entity';
import { Machine } from './machines/entities/machine.entity';
import { NfcTag } from './nfc-tags/entities/nfc-tag.entity';
import { Visit } from './visits/entities/visit.entity';
import { WorkOrder } from './work-orders/entities/work-order.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { Attachment } from './attachments/entities/attachment.entity';
import { SyncQueue } from './sync-queue/entities/sync-queue.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'nfcproject_dev',
      password: process.env.DB_PASSWORD || 'nfcproject_pass',
      database: process.env.DB_NAME || 'nfcproject_db',
      entities: [
        Tenant,
        User,
        Machine,
        NfcTag,
        Visit,
        WorkOrder,
        Ticket,
        Attachment,
        SyncQueue,
      ],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    TenantsModule,
    UsersModule,
    MachinesModule,
    NfcTagsModule,
    WorkOrdersModule,
    VisitsModule,
    TicketsModule,
    AttachmentsModule,
    SyncQueueModule,
  ],
})
export class AppModule {}