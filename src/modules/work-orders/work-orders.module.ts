import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from './entities/work-order.entity';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';
import { NfcTagsModule } from '../nfc-tags/nfc-tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrder]),
    NfcTagsModule, // Importamos el modulo completo que ya exporta NfcTag
  ],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
