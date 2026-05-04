import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MachineRepositoryPort } from '../../domain/repositories/machine.repository.port';
import { NfcTagRepositoryPort } from '../../../nfc-tags/repositories/nfc-tag.repository.port';
import { MachineModel } from '../../domain/models/machine.model';

@Injectable()
export class FindMachineByNfcUseCase {
  constructor(
    @Inject('MACHINE_REPOSITORY')
    private readonly machinesRepo: MachineRepositoryPort,
    @Inject('NFC_TAG_REPOSITORY')
    private readonly nfcTagsRepo: NfcTagRepositoryPort,
  ) {}

  async execute(nfcTagId: string, tenantId: string): Promise<MachineModel> {
    const normalizedNfcId = this.normalizeNfcId(nfcTagId);

    const nfcTag = await this.nfcTagsRepo.findByUid(normalizedNfcId, tenantId);
    if (!nfcTag) {
      throw new NotFoundException('No se encontró un tag NFC registrado con ese ID en esta empresa');
    }

    if (!nfcTag.isActive) {
      throw new ForbiddenException('Este tag NFC está inactivo');
    }

    if (!nfcTag.machine_id) {
      throw new NotFoundException('El tag NFC no está vinculado a ninguna máquina');
    }

    const machineTenantId = nfcTag.tenant_id || tenantId;
    const machineId = nfcTag.machine_id;
    
    const machine = await this.machinesRepo.findById(machineId, machineTenantId);
    if (!machine) {
      throw new NotFoundException('Máquina no encontrada');
    }

    return machine;
  }

  private normalizeNfcId(nfcId: string): string {
    return nfcId.replace(/[-\s]/g, '').toUpperCase();
  }
}
