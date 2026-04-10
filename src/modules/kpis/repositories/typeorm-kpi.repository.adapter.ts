import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kpi } from '../entities/kpi.entity';
import { KpiRepositoryPort } from './kpi.repository.port';

@Injectable()
export class TypeOrmKpiRepositoryAdapter implements KpiRepositoryPort {
  constructor(
    @InjectRepository(Kpi)
    private readonly repo: Repository<Kpi>,
  ) {}

  async findAll(tenantId: string): Promise<Kpi[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['user', 'sector'],
      order: { endDate: 'DESC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<Kpi | null> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    return this.repo.findOne({
      where,
      relations: ['user', 'sector'],
    });
  }

  async findByUser(userId: string, tenantId: string): Promise<Kpi[]> {
    return this.repo.find({
      where: { userId, tenantId },
      relations: ['sector'],
      order: { endDate: 'DESC' },
    });
  }

  async findBySector(sectorId: string, tenantId: string): Promise<Kpi[]> {
    return this.repo.find({
      where: { sectorId, tenantId },
      relations: ['user'],
      order: { endDate: 'DESC' },
    });
  }

  async create(kpi: Partial<Kpi>): Promise<Kpi> {
    const newKpi = this.repo.create(kpi);
    return this.repo.save(newKpi);
  }

  async save(kpi: Kpi): Promise<Kpi> {
    return this.repo.save(kpi);
  }

  async softRemove(kpi: Kpi): Promise<void> {
    await this.repo.softRemove(kpi);
  }
}
