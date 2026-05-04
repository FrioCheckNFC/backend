import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MachineRepositoryPort } from '../../domain/repositories/machine.repository.port';
import { NfcTagRepositoryPort } from '../../../nfc-tags/repositories/nfc-tag.repository.port';
import { ScanMachineDto } from '../../infrastructure/http/dto/scan-machine.dto';

@Injectable()
export class ScanMachineUseCase {
  private static readonly GPS_MAX_DISTANCE_METERS = 100;

  constructor(
    @Inject('MACHINE_REPOSITORY')
    private readonly machinesRepo: MachineRepositoryPort,
    @Inject('NFC_TAG_REPOSITORY')
    private readonly nfcTagsRepo: NfcTagRepositoryPort,
  ) {}

  async execute(dto: ScanMachineDto, tenantId: string): Promise<any> {
    const nfcTag = await this.nfcTagsRepo.findByUid(dto.nfcTagId, tenantId);
    if (!nfcTag) {
      throw new NotFoundException(`No se encontró registro para este tag NFC`);
    }

    const machine = await this.machinesRepo.findOne(nfcTag.machine_id, tenantId);
    if (!machine) {
      throw new NotFoundException(`No se encontró máquina vinculada a este tag`);
    }

    let gpsDistanceMeters = 0;
    let gpsValid = false;

    if (machine.latitude && machine.longitude) {
      gpsDistanceMeters = this.calculateDistance(
        machine.latitude,
        machine.longitude,
        dto.latitude,
        dto.longitude,
      );
      gpsValid = gpsDistanceMeters <= ScanMachineUseCase.GPS_MAX_DISTANCE_METERS;
    }

    return {
      machine: {
        id: machine.id,
        serialNumber: machine.serialNumber,
        model: machine.model,
        location: {
          name: machine.name || '',
          latitude: machine.latitude,
          longitude: machine.longitude,
        },
      },
      validation: {
        nfcValid: true,
        gpsValid,
        gpsDistanceMeters: Math.round(gpsDistanceMeters),
      },
    };
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
