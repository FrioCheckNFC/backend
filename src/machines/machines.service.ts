import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine, MachineStatus } from './entities/machine.entity';
import { CreateMachineDto, UpdateMachineDto } from './dto/machine.dto';
import { ScanMachineDto } from './dto/scan-machine.dto';
import { Visit } from '../visits/entities/visit.entity';

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private readonly machineRepository: Repository<Machine>,
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
  ) {}

  async create(createMachineDto: CreateMachineDto, tenantId: string): Promise<Machine> {
    const existingMachine = await this.machineRepository.findOne({
      where: { serialNumber: createMachineDto.serialNumber },
    });

    if (existingMachine) {
      throw new BadRequestException('Machine with this serial number already exists');
    }

    const machine = this.machineRepository.create({
      ...createMachineDto,
      tenant: { id: tenantId },
    });

    return this.machineRepository.save(machine);
  }

  async findAll(tenantId: string, status?: MachineStatus): Promise<Machine[]> {
    const query = this.machineRepository
      .createQueryBuilder('machine')
      .where('machine.tenant_id = :tenantId', { tenantId })
      .leftJoinAndSelect('machine.assignedUser', 'user')
      .leftJoinAndSelect('machine.nfcTag', 'nfcTag');

    if (status) {
      query.andWhere('machine.status = :status', { status });
    }

    return query.getMany();
  }

  async findById(id: string, tenantId?: string): Promise<Machine> {
    const where: any = { id };
    if (tenantId) {
      where.tenant = { id: tenantId };
    }

    const machine = await this.machineRepository.findOne({
      where,
      relations: ['assignedUser', 'nfcTag', 'tenant'],
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return machine;
  }

  async findBySerialNumber(serialNumber: string, tenantId: string): Promise<Machine> {
    const machine = await this.machineRepository.findOne({
      where: { serialNumber, tenant: { id: tenantId } },
      relations: ['assignedUser', 'nfcTag'],
    });

    if (!machine) {
      throw new NotFoundException(`Machine with serial number ${serialNumber} not found`);
    }

    return machine;
  }

  async update(id: string, updateMachineDto: UpdateMachineDto): Promise<Machine> {
    const machine = await this.findById(id);

    if (updateMachineDto.status === MachineStatus.DECOMMISSIONED) {
      // Máquina decomisionada bloquea operaciones
      machine.status = MachineStatus.DECOMMISSIONED;
    }

    Object.assign(machine, updateMachineDto);
    return this.machineRepository.save(machine);
  }

  async remove(id: string): Promise<void> {
    const machine = await this.findById(id);
    await this.machineRepository.softRemove(machine);
  }

  async scan(scanMachineDto: ScanMachineDto, tenantId: string): Promise<any> {
    // Buscar máquina por serialNumber (el nfcTagId es el serial) y que pertenezca al tenant
    const machine = await this.machineRepository.findOne({
      where: { 
        serialNumber: scanMachineDto.nfcTagId,
        tenant: { id: tenantId }
      },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with serial number ${scanMachineDto.nfcTagId} not found for this tenant`);
    }

    // Para validar NFC UID, sería necesario cargar la relación nfcTag
    // Por ahora, simplemente retornamos nfcValid: false si no hay tag asociado
    const nfcValid = false; // TODO: Implementar carga de nfcTag cuando exista

    // Validar GPS: calcular distancia entre coordenadas escaneadas y ubicación registrada
    let gpsValid = false;
    let gpsDistanceMeters = 0;

    if (machine.locationLat && machine.locationLng) {
      gpsDistanceMeters = this.calculateDistance(
        parseFloat(machine.locationLat.toString()),
        parseFloat(machine.locationLng.toString()),
        scanMachineDto.latitude,
        scanMachineDto.longitude,
      );
      // Tolerancia: 100 metros (configurable por tenant)
      gpsValid = gpsDistanceMeters <= 100;
    }

    // Obtener última visita del tenant
    // TODO: Implementar cuando se sincronicen las entidades Visit
    const lastVisit = null;

    return {
      machine: {
        id: machine.id,
        serialNumber: machine.serialNumber,
        model: machine.model,
        status: machine.status,
        location: {
          name: machine.locationName,
          latitude: machine.locationLat,
          longitude: machine.locationLng,
        },
      },
      validation: {
        nfcValid,
        gpsValid,
        gpsDistanceMeters: Math.round(gpsDistanceMeters),
      },
      lastVisit,
    };
  }

  // Calcular distancia en metros entre dos coordenadas (fórmula Haversine)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Radio de la Tierra en metros
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

  // Validación de negocio
  canOperateOnMachine(machine: Machine): boolean {
    return machine.status !== MachineStatus.DECOMMISSIONED;
  }
}
