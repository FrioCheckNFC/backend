// services/machines.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Machine } from '../entities/machine.entity';
import { CreateMachineDto } from '../dto/create-machine.dto';
import { UpdateMachineDto } from '../dto/update-machine.dto';
import { ScanMachineDto } from '../dto/scan-machine.dto';
import { NfcReadDto } from '../dto/nfc-read.dto';
import { MachineRepositoryPort } from '../repositories/machine.repository.port';
import { NfcTagRepositoryPort } from '../../nfc-tags/repositories/nfc-tag.repository.port';

@Injectable()
export class MachinesService {
  constructor(
    @Inject('MACHINE_REPOSITORY')
    private readonly machinesRepo: MachineRepositoryPort,
    @Inject('NFC_TAG_REPOSITORY')
    private readonly nfcTagsRepo: NfcTagRepositoryPort,
  ) {}

  private static readonly GPS_MAX_DISTANCE_METERS = 100;

  async findAll(tenantId: string): Promise<Machine[]> {
    return this.machinesRepo.findAll(tenantId);
  }

  async findOne(id: string, tenantId: string): Promise<Machine> {
    const machine = await this.machinesRepo.findOne(id, tenantId);
    if (!machine) {
      throw new NotFoundException('Máquina no encontrada');
    }
    return machine;
  }

  async findByNfc(nfcTagId: string, tenantId: string): Promise<Machine> {
    const normalizedNfcId = this.normalizeNfcId(nfcTagId);

    const nfcTag = await this.nfcTagsRepo.findByUid(normalizedNfcId, tenantId);
    if (!nfcTag) {
      throw new NotFoundException('No se encontró un tag NFC registrado con ese ID en esta empresa');
    }

    if (!nfcTag.isActive) {
      throw new ForbiddenException('Este tag NFC está inactivo');
    }

    const machine = await this.machinesRepo.findOne(nfcTag.machine_id, tenantId);
    if (!machine) {
      throw new NotFoundException('El tag NFC está registrado pero no está vinculado a una máquina');
    }

    return machine;
  }

  async create(dto: CreateMachineDto, tenantId: string): Promise<Machine> {
    if (dto.nfcTagId) {
      const exists = await this.nfcTagsRepo.findByUid(dto.nfcTagId, tenantId);
      if (exists) {
        throw new BadRequestException('Este tag NFC ya está asignado a otra máquina');
      }
    }

    return this.machinesRepo.create({ ...dto, tenantId });
  }

  async update(id: string, dto: UpdateMachineDto, tenantId: string): Promise<Machine> {
    const machine = await this.findOne(id, tenantId);

    if (dto.nfcTagId) {
      const nfcTag = await this.nfcTagsRepo.findByUid(dto.nfcTagId, tenantId);
      if (nfcTag && nfcTag.machine_id !== id) {
        throw new BadRequestException('Ese tag NFC ya está asignado a otra máquina');
      }
    }

    Object.assign(machine, dto);
    return this.machinesRepo.save(machine);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const machine = await this.findOne(id, tenantId);
    await this.machinesRepo.softRemove(machine);
  }

  async scan(dto: ScanMachineDto, tenantId: string): Promise<any> {
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
        parseFloat(machine.latitude.toString()),
        parseFloat(machine.longitude.toString()),
        dto.latitude,
        dto.longitude,
      );
      gpsValid = gpsDistanceMeters <= MachinesService.GPS_MAX_DISTANCE_METERS;
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

  async nfcRead(dto: NfcReadDto, tenantId: string, userRoles?: string[]): Promise<any> {
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
        parseFloat(machine.latitude.toString()),
        parseFloat(machine.longitude.toString()),
        dto.latitude,
        dto.longitude,
      );
      gpsDistanceMeters = distance;
      gpsValid = distance <= MachinesService.GPS_MAX_DISTANCE_METERS;
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
        maxDistanceMeters: MachinesService.GPS_MAX_DISTANCE_METERS,
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

  private normalizeStatus(status: string | undefined, isActive: boolean): string {
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
