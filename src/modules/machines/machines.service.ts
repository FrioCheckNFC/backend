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
}
