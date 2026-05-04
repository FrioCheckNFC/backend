import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { MachineRepositoryPort } from '../../domain/repositories/machine.repository.port';
import { MachineModel } from '../../domain/models/machine.model';
import { CreateMachineDto } from '../../infrastructure/http/dto/create-machine.dto';
import { NfcTagRepositoryPort } from '../../../nfc-tags/repositories/nfc-tag.repository.port';

@Injectable()
export class CreateMachineUseCase {
  constructor(
    @Inject('MACHINE_REPOSITORY')
    private readonly machinesRepo: MachineRepositoryPort,
    @Inject('NFC_TAG_REPOSITORY')
    private readonly nfcTagsRepo: NfcTagRepositoryPort,
  ) {}

  async execute(dto: CreateMachineDto, tenantId: string): Promise<MachineModel> {
    if (dto.nfcTagId) {
      const exists = await this.nfcTagsRepo.findByUid(dto.nfcTagId, tenantId);
      if (exists) {
        throw new BadRequestException('Este tag NFC ya está asignado a otra máquina');
      }
    }

    const newMachineData: Partial<MachineModel> = {
      ...dto,
      tenantId,
    };

    return this.machinesRepo.create(newMachineData);
  }
}
