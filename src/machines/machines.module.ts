import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Machine } from './entities/machine.entity';
import { Visit } from '../visits/entities/visit.entity';
import { MachinesService } from './machines.service';
import { MachinesController } from './machines.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Machine, Visit])],
  providers: [MachinesService],
  controllers: [MachinesController],
  exports: [MachinesService, TypeOrmModule],
})
export class MachinesModule {}