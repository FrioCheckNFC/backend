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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nfcproject_dev',
      password: 'nfcproject_pass',
      database: 'nfcproject_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // false porque ya tenemos el schema creado
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