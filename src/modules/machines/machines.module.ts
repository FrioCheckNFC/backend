import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades de BD e Infraestructura
import { MachineTypeOrmEntity } from './infrastructure/database/entities/machine.typeorm.entity';
import { MachineTypeOrmRepository } from './infrastructure/database/repositories/machine.typeorm.repository';
import { NfcTagsModule } from '../nfc-tags/nfc-tags.module';

// Application Use Cases
import { FindAllMachinesUseCase } from './application/use-cases/find-all-machines.use-case';
import { FindMachineUseCase } from './application/use-cases/find-machine.use-case';
import { FindMachineByNfcUseCase } from './application/use-cases/find-machine-by-nfc.use-case';
import { CreateMachineUseCase } from './application/use-cases/create-machine.use-case';
import { UpdateMachineUseCase } from './application/use-cases/update-machine.use-case';
import { RemoveMachineUseCase } from './application/use-cases/remove-machine.use-case';
import { ScanMachineUseCase } from './application/use-cases/scan-machine.use-case';
import { NfcReadMachineUseCase } from './application/use-cases/nfc-read-machine.use-case';

// Controladores
import { MachinesController } from './infrastructure/http/controllers/machines.controller';

const useCases = [
  FindAllMachinesUseCase,
  FindMachineUseCase,
  FindMachineByNfcUseCase,
  CreateMachineUseCase,
  UpdateMachineUseCase,
  RemoveMachineUseCase,
  ScanMachineUseCase,
  NfcReadMachineUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([MachineTypeOrmEntity]),
    NfcTagsModule, // Importamos para tener acceso a NFC_TAG_REPOSITORY (Mientras se migra)
  ],
  controllers: [MachinesController],
  providers: [
    ...useCases,
    {
      provide: 'MACHINE_REPOSITORY',
      useClass: MachineTypeOrmRepository,
    },
  ],
  exports: [
    ...useCases,
    'MACHINE_REPOSITORY',
  ],
})
export class MachinesModule {}
