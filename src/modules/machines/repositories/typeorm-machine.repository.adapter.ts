import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from '../entities/machine.entity';
import { MachineRepositoryPort } from './machine.repository.port';
import { Visit } from '../../visits/entities/visit.entity';

@Injectable()
export class TypeOrmMachineRepositoryAdapter implements MachineRepositoryPort {
  constructor(
    @InjectRepository(Machine)
    private readonly repo: Repository<Machine>,
  ) {}

  async findAll(tenantId: string): Promise<Machine[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['store'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(identifier: string, tenantId: string): Promise<Machine | null> {
    const query = this.repo.createQueryBuilder('machine')
      .leftJoinAndSelect('machine.store', 'store')
      .where('machine.tenant_id = :tenantId', { tenantId });

    if (this.isUUID(identifier)) {
      query.andWhere('(machine.id = :identifier OR machine.serial_number = :identifier)', { identifier });
    } else {
      query.andWhere('machine.serial_number = :identifier', { identifier });
    }

    return query.getOne();
  }

  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  async create(machine: Partial<Machine>): Promise<Machine> {
    const newMachine = this.repo.create(machine);
    return this.repo.save(newMachine);
  }

  async save(machine: Machine): Promise<Machine> {
    return this.repo.save(machine);
  }

  async softRemove(machine: Machine): Promise<void> {
    await this.repo.softRemove(machine);
  }

  async getLastControlDetails(machineId: string, tenantId: string): Promise<any> {
    const lastVisit = await this.repo.manager.getRepository(Visit)
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.technician', 'u')
      .where('v.machineId = :machineId', { machineId })
      .andWhere('v.tenantId = :tenantId', { tenantId })
      .orderBy('v.visitedAt', 'DESC')
      .getOne();

    if (!lastVisit) return null;

    return {
      date: lastVisit.visitedAt,
      status: lastVisit.status,
      userName: `${lastVisit.technician?.firstName || ''} ${lastVisit.technician?.lastName || ''}`.trim(),
      summary: lastVisit.notes,
    };
  }

  async getRecentVisits(machineId: string, tenantId: string, limit: number): Promise<any[]> {
    const visits = await this.repo.manager.getRepository(Visit)
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.technician', 'u')
      .where('v.machineId = :machineId', { machineId })
      .andWhere('v.tenantId = :tenantId', { tenantId })
      .orderBy('v.visitedAt', 'DESC')
      .limit(limit)
      .getMany();

    return visits.map((v) => ({
      id: v.id,
      date: v.visitedAt,
      status: v.status,
      userName: `${v.technician?.firstName || ''} ${v.technician?.lastName || ''}`.trim(),
      userRole: v.technician?.role ? v.technician.role[0] : null,
    }));
  }
}
