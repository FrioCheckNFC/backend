import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from './entities/work-order.entity';
import { WorkOrdersService } from './services/work-orders.service';
import { WorkOrdersController } from './controllers/work-orders.controller';
import { NfcTagsModule } from '../nfc-tags/nfc-tags.module';
import { TypeOrmWorkOrderRepositoryAdapter } from './repositories/typeorm-work-order.repository.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrder]),
    NfcTagsModule,
  ],
  controllers: [WorkOrdersController],
  providers: [
    WorkOrdersService,
    {
      provide: 'WORK_ORDER_REPOSITORY',
      useClass: TypeOrmWorkOrderRepositoryAdapter,
    },
  ],
  exports: [WorkOrdersService, 'WORK_ORDER_REPOSITORY'],
})
export class WorkOrdersModule {}
