// machines.module.ts
// Módulo de máquinas/equipos de refrigeración.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Machine } from './entities/machine.entity';
import { NfcTag } from '../nfc-tags/entities/nfc-tag.entity';
import { MachinesController } from './machines.controller';
import { MachinesService } from './machines.service';

@Module({
  imports: [TypeOrmModule.forFeature([Machine, NfcTag])],
  controllers: [MachinesController],
  providers: [MachinesService],
  exports: [MachinesService],
})
export class MachinesModule {}
