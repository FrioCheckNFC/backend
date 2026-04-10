import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { TenantRepositoryPort } from './tenant.repository.port';

@Injectable()
export class TypeOrmTenantRepositoryAdapter implements TenantRepositoryPort {
  constructor(
    @InjectRepository(Tenant)
    private readonly repo: Repository<Tenant>,
  ) {}

  async findAll(): Promise<Tenant[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tenant | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async create(tenant: Partial<Tenant>): Promise<Tenant> {
    const newTenant = this.repo.create(tenant);
    return this.repo.save(newTenant);
  }

  async save(tenant: Tenant): Promise<Tenant> {
    return this.repo.save(tenant);
  }

  async softRemove(tenant: Tenant): Promise<void> {
    await this.repo.softRemove(tenant);
  }
}
