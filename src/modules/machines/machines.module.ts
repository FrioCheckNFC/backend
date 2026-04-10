// machines.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Machine } from './entities/machine.entity';
import { MachinesController } from './controllers/machines.controller';
import { MachinesService } from './services/machines.service';
import { TypeOrmMachineRepositoryAdapter } from './repositories/typeorm-machine.repository.adapter';
import { NfcTagsModule } from '../nfc-tags/nfc-tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Machine]),
    NfcTagsModule, // Importamos para tener acceso a NFC_TAG_REPOSITORY
  ],
  controllers: [MachinesController],
  providers: [
    MachinesService,
    {
      provide: 'MACHINE_REPOSITORY',
      useClass: TypeOrmMachineRepositoryAdapter,
    },
  ],
  exports: [MachinesService, 'MACHINE_REPOSITORY'],
})
export class MachinesModule {}
