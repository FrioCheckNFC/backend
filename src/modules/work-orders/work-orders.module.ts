import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from './entities/work-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder])],
  exports: [TypeOrmModule],
})
export class WorkOrdersModule {}
