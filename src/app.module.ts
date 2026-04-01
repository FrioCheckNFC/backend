import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { UserRoleEntity } from './users/entities/user-role.entity';
import { Machine } from './machines/entities/machine.entity';
import { NfcTag } from './nfc-tags/entities/nfc-tag.entity';
import { Visit } from './visits/entities/visit.entity';
import { WorkOrder } from './work-orders/entities/work-order.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { Attachment } from './attachments/entities/attachment.entity';
import { SyncQueue } from './sync-queue/entities/sync-queue.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Tenant,
        User,
        UserRoleEntity,
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
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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