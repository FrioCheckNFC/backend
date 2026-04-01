import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from './entities/work-order.entity';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder])],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [TypeOrmModule, WorkOrdersService],
})
export class WorkOrdersModule {}
