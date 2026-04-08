// machines.service.ts
// CRUD de máquinas/equipos de refrigeración, filtrado por tenant.

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from './entities/machine.entity';
import { NfcTag } from '../nfc-tags/entities/nfc-tag.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { ScanMachineDto } from './dto/scan-machine.dto';
import { NfcReadDto } from './dto/nfc-read.dto';

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepo: Repository<Machine>,
    @InjectRepository(NfcTag)
    private nfcTagsRepo: Repository<NfcTag>,
  ) {}

  async findAll(tenantId: string): Promise<Machine[]> {
    return this.machinesRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Machine> {
    const machine = await this.machinesRepo.findOne({
      where: { id, tenantId },
    });
    if (!machine) {
      throw new NotFoundException('Máquina no encontrada');
    }
    return machine;
  }

  async findByNfc(nfcTagId: string, tenantId: string): Promise<Machine> {
    const normalizedNfcId = this.normalizeNfcId(nfcTagId);

    const nfcTag = await this.nfcTagsRepo.findOne({
      where: [
        { id: normalizedNfcId, tenant_id: tenantId },
        { uid: normalizedNfcId, tenant_id: tenantId },
      ],
    });

    if (!nfcTag) {
      throw new NotFoundException(
        'No se encontró un tag NFC registrado con ese ID en esta empresa',
      );
    }

    if (!nfcTag.isActive) {
      throw new ForbiddenException('Este tag NFC está inactivo');
    }

    const machine = await this.machinesRepo.findOne({
      where: { id: nfcTag.machine_id, tenantId },
    });

    if (!machine) {
      throw new NotFoundException(
        'El tag NFC está registrado pero no está vinculado a una máquina',
      );
    }

    return machine;
  }

  async create(dto: CreateMachineDto, tenantId: string): Promise<Machine> {
    if (dto.nfcTagId) {
      const exists = await this.nfcTagsRepo.findOne({
        where: { uid: dto.nfcTagId, tenant_id: tenantId },
      });
      if (exists) {
        throw new BadRequestException(
          'Este tag NFC ya está asignado a otra máquina',
        );
      }
    }

    const machine = this.machinesRepo.create({ ...dto, tenantId });
    return this.machinesRepo.save(machine);
  }

  async update(
    id: string,
    dto: UpdateMachineDto,
    tenantId: string,
  ): Promise<Machine> {
    const machine = await this.findOne(id, tenantId);

    if (dto.nfcTagId) {
      const nfcTag = await this.nfcTagsRepo.findOne({
        where: { uid: dto.nfcTagId, tenant_id: tenantId },
      });
      if (nfcTag && nfcTag.machine_id !== id) {
        throw new BadRequestException(
          'Ese tag NFC ya está asignado a otra máquina',
        );
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
    const nfcTag = await this.nfcTagsRepo.findOne({
      where: { uid: dto.nfcTagId, tenant_id: tenantId },
    });

    if (!nfcTag) {
      throw new NotFoundException(`No se encontró registro para este tag NFC`);
    }

    const machine = await this.machinesRepo.findOne({
      where: { id: nfcTag.machine_id, tenantId },
    });

    if (!machine) {
      throw new NotFoundException(`No se encontró máquina vinculada a este tag`);
    }

    const nfcValid = true; // Si llegamos aquí el nfc_tag_id coincidió en nfc_tags table

    let gpsDistanceMeters = 0;
    let gpsValid = false;

    if (machine.latitude && machine.longitude) {
      gpsDistanceMeters = this.calculateDistance(
        parseFloat(machine.latitude.toString()),
        parseFloat(machine.longitude.toString()),
        dto.latitude,
        dto.longitude,
      );
      gpsValid = gpsDistanceMeters <= 100;
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
        nfcValid,
        gpsValid,
        gpsDistanceMeters: Math.round(gpsDistanceMeters),
      },
    };
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private static readonly GPS_MAX_DISTANCE_METERS = 100;

  private normalizeNfcId(nfcId: string): string {
    const cleanId = nfcId.replace(/[:-]/g, '').toLowerCase();
    if (cleanId.length === 32) {
      return `${cleanId.slice(0, 8)}-${cleanId.slice(8, 12)}-${cleanId.slice(12, 16)}-${cleanId.slice(16, 20)}-${cleanId.slice(20, 32)}`;
    }
    return nfcId.toLowerCase();
  }

  async nfcRead(
    dto: NfcReadDto,
    tenantId: string,
    userRoles?: string[],
  ): Promise<any> {
    const normalizedNfcId = this.normalizeNfcId(dto.nfcId);

    const nfcTag = await this.nfcTagsRepo.findOne({
      where: [
        { id: normalizedNfcId, tenant_id: tenantId },
        { uid: normalizedNfcId, tenant_id: tenantId },
      ],
    });

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

    const machine = await this.machinesRepo.findOne({
      where: { id: nfcTag.machine_id, tenantId },
      relations: ['tenant'],
    });

    if (!machine) {
      throw new NotFoundException({
        error: 'MACHINE_NOT_LINKED',
        message:
          'El tag NFC está registrado pero no está vinculado a una máquina',
        nfcId: normalizedNfcId,
      });
    }

    const lastControl = await this.getLastControlDetails(machine.id, tenantId);
    const recentVisits = await this.getRecentVisits(machine.id, tenantId, 5);
    const allowedActions = this.getAllowedActions(userRoles);

    let gpsDistanceMeters: number | null = null;
    let gpsValid = false;

    if (
      machine.latitude &&
      machine.longitude &&
      dto.latitude &&
      dto.longitude
    ) {
      const distance = this.calculateDistance(
        parseFloat(machine.latitude.toString()),
        parseFloat(machine.longitude.toString()),
        dto.latitude,
        dto.longitude,
      );
      gpsDistanceMeters = distance;
      gpsValid = distance <= MachinesService.GPS_MAX_DISTANCE_METERS;
    }

    const machineStatus = this.normalizeStatus(
      machine.status,
      machine.isActive,
    );
    const isVendor = userRoles?.includes('VENDOR') ?? false;

    return {
      found: true,
      machine: {
        id: machine.id,
        name: machine.name,
        brand: machine.brand,
        model: machine.model,
        serialNumber: machine.serialNumber,
        nfcId: dto.nfcId, // Usamos el ID del DTO original
        nfcCode: null,
        client: null,
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
      clientStatus: null,
      validation: {
        gpsValid,
        gpsDistanceMeters: gpsDistanceMeters
          ? Math.round(gpsDistanceMeters)
          : null,
        maxDistanceMeters: MachinesService.GPS_MAX_DISTANCE_METERS,
        isWithinRange: gpsValid,
      },
    };
  }

  private normalizeStatus(
    status: string | undefined,
    isActive: boolean,
  ): string {
    if (!isActive) return 'INACTIVE';
    const validStatuses = [
      'OPERATIVE',
      'MAINTENANCE',
      'OUT_OF_SERVICE',
      'PENDING_INSTALL',
    ];
    const normalizedStatus = status || 'OPERATIVE';
    return validStatuses.includes(normalizedStatus)
      ? normalizedStatus
      : 'OPERATIVE';
  }

  private getClientStatus(clientId?: string): any {
    if (!clientId) return null;
    return {
      hasDebt: false,
      pendingAmount: 0,
      lastOrder: null,
      canOrder: true,
    };
  }

  private getAllowedActions(roles?: string[]): string[] {
    const userRoles = roles || ['TECHNICIAN'];

    const allActions: string[] = [];

    if (userRoles.includes('ADMIN')) {
      allActions.push(
        'VIEW_MACHINE',
        'VIEW_VISITS',
        'CREATE_VISIT',
        'CREATE_ORDER',
        'REPORT_MERMA',
        'UPDATE_MACHINE',
        'DELETE_MACHINE',
      );
    }

    if (userRoles.includes('TECHNICIAN')) {
      allActions.push(
        'VIEW_MACHINE',
        'VIEW_VISITS',
        'CREATE_VISIT',
        'REPORT_MERMA',
      );
    }

    if (userRoles.includes('VENDOR')) {
      allActions.push(
        'VIEW_MACHINE',
        'VIEW_VISITS',
        'CREATE_SALE',
        'VIEW_CLIENT',
      );
    }

    return [...new Set(allActions)];
  }

  private async getLastControlDetails(
    machineId: string,
    tenantId: string,
  ): Promise<any | null> {
    const lastVisit = await this.machinesRepo.manager.query(
      `SELECT v.id, v.visited_at, v.status, v.notes, u.name as user_name, u.role
       FROM visits v
       LEFT JOIN users u ON u.id = v.technician_id
       WHERE v.machine_id = $1 AND v.tenant_id = $2
       ORDER BY v.visited_at DESC
       LIMIT 1`,
      [machineId, tenantId],
    );
    if (lastVisit.length === 0) return null;
    const v = lastVisit[0];
    return {
      date: v.visited_at,
      status: v.status,
      userName: v.user_name,
      summary: v.notes,
    };
  }

  private async getRecentVisits(
    machineId: string,
    tenantId: string,
    limit: number,
  ): Promise<any[]> {
    const visits = await this.machinesRepo.manager.query(
      `SELECT v.id, v.visited_at, v.status, u.name as user_name, u.role
       FROM visits v
       LEFT JOIN users u ON u.id = v.technician_id
       WHERE v.machine_id = $1 AND v.tenant_id = $2
       ORDER BY v.visited_at DESC
       LIMIT $3`,
      [machineId, tenantId, limit],
    );
    return visits.map((v: any) => ({
      id: v.id,
      date: v.visited_at,
      status: v.status,
      userName: v.user_name,
      userRole: v.role,
    }));
  }
}
