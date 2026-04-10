import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from '../entities/visit.entity';
import { VisitRepositoryPort } from './visit.repository.port';

@Injectable()
export class TypeOrmVisitRepositoryAdapter implements VisitRepositoryPort {
  constructor(
    @InjectRepository(Visit)
    private readonly repo: Repository<Visit>,
  ) {}

  async findAll(tenantId: string): Promise<Visit[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['technician', 'machine'],
      order: { visitedAt: 'DESC' },
    });
  }

  async findByTechnician(
    technicianId: string,
    tenantId: string,
  ): Promise<Visit[]> {
    return this.repo.find({
      where: { technicianId, tenantId },
      relations: ['machine'],
      order: { visitedAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Visit | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['technician', 'machine'],
    });
  }

  async findPending(
    technicianId: string,
    machineId: string,
  ): Promise<Visit | null> {
    return this.repo.findOne({
      where: {
        technicianId,
        machineId,
        status: 'pending',
      },
    });
  }

  async create(visit: Partial<Visit>): Promise<Visit> {
    const newVisit = this.repo.create(visit);
    return this.repo.save(newVisit);
  }

  async save(visit: Visit): Promise<Visit> {
    return this.repo.save(visit);
  }

  async softRemove(visit: Visit): Promise<void> {
    await this.repo.softRemove(visit);
  }
}
