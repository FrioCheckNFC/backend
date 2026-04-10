import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sector } from '../entities/sector.entity';
import { SectorRepositoryPort } from './sector.repository.port';

@Injectable()
export class TypeOrmSectorRepositoryAdapter implements SectorRepositoryPort {
  constructor(
    @InjectRepository(Sector)
    private readonly repo: Repository<Sector>,
  ) {}

  async findAll(tenantId: string): Promise<Sector[]> {
    return this.repo.find({
      where: { tenantId },
      order: { comuna: 'ASC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<Sector | null> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    return this.repo.findOne({ where });
  }

  async findByGeography(
    comuna: string,
    city: string,
    tenantId: string,
  ): Promise<Sector | null> {
    return this.repo.findOne({
      where: { comuna, city, tenantId },
    });
  }

  async create(sector: Partial<Sector>): Promise<Sector> {
    const newSector = this.repo.create(sector);
    return this.repo.save(newSector);
  }

  async save(sector: Sector): Promise<Sector> {
    return this.repo.save(sector);
  }

  async softRemove(sector: Sector): Promise<void> {
    await this.repo.softRemove(sector);
  }
}
