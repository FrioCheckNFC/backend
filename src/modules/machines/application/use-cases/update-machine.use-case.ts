import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { MachineRepositoryPort } from '../../domain/repositories/machine.repository.port';
import { NfcTagRepositoryPort } from '../../../nfc-tags/repositories/nfc-tag.repository.port';
import { MachineModel } from '../../domain/models/machine.model';
import { UpdateMachineDto } from '../../infrastructure/http/dto/update-machine.dto';

@Injectable()
export class UpdateMachineUseCase {
  constructor(
    @Inject('MACHINE_REPOSITORY')
    private readonly machinesRepo: MachineRepositoryPort,
    @Inject('NFC_TAG_REPOSITORY')
    private readonly nfcTagsRepo: NfcTagRepositoryPort,
  ) {}

  async execute(id: string, dto: UpdateMachineDto, tenantId: string): Promise<MachineModel> {
    const machine = await this.machinesRepo.findOne(id, tenantId);
    if (!machine) {
       throw new NotFoundException('Máquina no encontrada');
    }

    if (dto.nfcTagId) {
      const nfcTag = await this.nfcTagsRepo.findByUid(dto.nfcTagId, tenantId);
      if (nfcTag && nfcTag.machine_id !== id) {
        throw new BadRequestException('Ese tag NFC ya está asignado a otra máquina');
      }
    }

    // Actualizamos las propiedades del modelo (podría ser un método dentro de MachineModel)
    if (dto.name !== undefined) machine.name = dto.name;
    if (dto.latitude !== undefined) machine.latitude = dto.latitude;
    if (dto.longitude !== undefined) machine.longitude = dto.longitude;
    if (dto.brand !== undefined) machine.brand = dto.brand;
    if (dto.model !== undefined) machine.model = dto.model;
    if (dto.serialNumber !== undefined) machine.serialNumber = dto.serialNumber;
    if (dto.status !== undefined) machine.status = dto.status;
    if (dto.acquisitionType !== undefined) machine.acquisitionType = dto.acquisitionType;
    if (dto.isActive !== undefined) machine.isActive = dto.isActive;
    
    // Aquí el control de fecha de actualización podría ir en el mismo modelo puro.
    machine.updatedAt = new Date();

    return this.machinesRepo.save(machine);
  }
}
