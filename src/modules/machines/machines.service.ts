// machines.service.ts
// CRUD de máquinas/equipos de refrigeración, filtrado por tenant.

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from './entities/machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { ScanMachineDto } from './dto/scan-machine.dto';

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepo: Repository<Machine>,
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
    const machine = await this.machinesRepo.findOne({
      where: { nfcTagId, tenantId },
    });
    if (!machine) {
      throw new NotFoundException('No se encontró una máquina con ese tag NFC');
    }
    return machine;
  }

  async create(dto: CreateMachineDto, tenantId: string): Promise<Machine> {
    if (dto.nfcTagId) {
      const exists = await this.machinesRepo.findOne({
        where: { nfcTagId: dto.nfcTagId },
      });
      if (exists) {
        throw new BadRequestException(
          'Ese tag NFC ya está asignado a otra máquina',
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

    if (dto.nfcTagId && dto.nfcTagId !== machine.nfcTagId) {
      const nfcTaken = await this.machinesRepo.findOne({
        where: { nfcTagId: dto.nfcTagId },
      });
      if (nfcTaken) {
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
    const machine = await this.machinesRepo.findOne({
      where: { nfcTagId: dto.nfcTagId, tenantId },
    });

    if (!machine) {
      throw new NotFoundException(`No se encontró máquina para este tag NFC`);
    }

    const nfcValid = machine.nfcTagId === dto.nfcUid || machine.nfcTagId === dto.nfcTagId;

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
          name: machine.location,
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

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
}
