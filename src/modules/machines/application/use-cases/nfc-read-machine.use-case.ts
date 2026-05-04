import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MachineRepositoryPort } from '../../domain/repositories/machine.repository.port';
import { NfcTagRepositoryPort } from '../../../nfc-tags/repositories/nfc-tag.repository.port';
import { NfcReadDto } from '../../infrastructure/http/dto/nfc-read.dto';

@Injectable()
export class NfcReadMachineUseCase {
  private static readonly GPS_MAX_DISTANCE_METERS = 100;

  constructor(
    @Inject('MACHINE_REPOSITORY')
    private readonly machinesRepo: MachineRepositoryPort,
    @Inject('NFC_TAG_REPOSITORY')
    private readonly nfcTagsRepo: NfcTagRepositoryPort,
  ) {}

  async execute(dto: NfcReadDto, tenantId: string, userRoles?: string[]): Promise<any> {
    const normalizedNfcId = this.normalizeNfcId(dto.nfcId);

    const nfcTag = await this.nfcTagsRepo.findByUid(normalizedNfcId, tenantId);
    if (!nfcTag) {
      throw new NotFoundException({
        error: 'NFC_NOT_REGISTERED',
        message: 'Este tag NFC no está registrado en esta empresa',
        nfcId: normalizedNfcId,
      });
    }

    if (!nfcTag.isActive) {
      throw new ForbiddenException({
        error: 'NFC_BLOCKED',
        message: 'Este tag NFC está inactivo',
        nfcId: normalizedNfcId,
      });
    }

    const machine = await this.machinesRepo.findOne(nfcTag.machine_id, tenantId);
    if (!machine) {
      throw new NotFoundException({
        error: 'MACHINE_NOT_LINKED',
        message: 'El tag NFC está registrado pero no está vinculado a una máquina',
        nfcId: normalizedNfcId,
      });
    }

    const lastControl = await this.machinesRepo.getLastControlDetails(machine.id, tenantId);
    const recentVisits = await this.machinesRepo.getRecentVisits(machine.id, tenantId, 5);
    const allowedActions = this.getAllowedActions(userRoles);

    let gpsDistanceMeters: number | null = null;
    let gpsValid = false;

    if (machine.latitude && machine.longitude && dto.latitude && dto.longitude) {
      const distance = this.calculateDistance(
        machine.latitude,
        machine.longitude,
        dto.latitude,
        dto.longitude,
      );
      gpsDistanceMeters = distance;
      gpsValid = distance <= NfcReadMachineUseCase.GPS_MAX_DISTANCE_METERS;
    }

    const machineStatus = this.normalizeStatus(machine.status, machine.isActive);

    return {
      found: true,
      machine: {
        id: machine.id,
        name: machine.name,
        brand: machine.brand,
        model: machine.model,
        serialNumber: machine.serialNumber,
        nfcId: dto.nfcId,
        status: machineStatus,
        location: machine.latitude && machine.longitude
          ? {
              address: machine.name || '',
              latitude: machine.latitude,
              longitude: machine.longitude,
            }
          : null,
        isActive: machine.isActive,
      },
      lastControl,
      visits: recentVisits,
      allowedActions,
      validation: {
        gpsValid,
        gpsDistanceMeters: gpsDistanceMeters ? Math.round(gpsDistanceMeters) : null,
        maxDistanceMeters: NfcReadMachineUseCase.GPS_MAX_DISTANCE_METERS,
        isWithinRange: gpsValid,
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

  private normalizeNfcId(nfcId: string): string {
    return nfcId.replace(/[-\s]/g, '').toUpperCase();
  }

  private normalizeStatus(status: string | undefined | null, isActive: boolean): string {
    if (!isActive) return 'OUT_OF_SERVICE';
    const validStatuses = ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE'];
    const normalizedStatus = status || 'ACTIVE';
    return validStatuses.includes(normalizedStatus) ? normalizedStatus : 'ACTIVE';
  }

  private getAllowedActions(roles?: string[]): string[] {
    const userRoles = roles || ['TECHNICIAN'];
    const allActions: string[] = [];
    if (userRoles.includes('ADMIN')) {
      allActions.push('VIEW_MACHINE', 'VIEW_VISITS', 'CREATE_VISIT', 'CREATE_ORDER', 'REPORT_MERMA', 'UPDATE_MACHINE', 'DELETE_MACHINE');
    }
    if (userRoles.includes('TECHNICIAN')) {
      allActions.push('VIEW_MACHINE', 'VIEW_VISITS', 'CREATE_VISIT', 'REPORT_MERMA');
    }
    if (userRoles.includes('VENDOR')) {
      allActions.push('VIEW_MACHINE', 'VIEW_VISITS', 'CREATE_SALE', 'VIEW_CLIENT');
    }
    return [...new Set(allActions)];
  }
}
