import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantTypeOrmEntity } from '../entities/tenant.typeorm.entity';
import { TenantRepositoryPort } from '../../../domain/repositories/tenant.repository.port';
import { TenantModel } from '../../../domain/models/tenant.model';
import { TenantMapper } from '../mappers/tenant.mapper';

@Injectable()
export class TypeormTenantRepositoryAdapter implements TenantRepositoryPort {
  constructor(
    @InjectRepository(TenantTypeOrmEntity)
    private readonly repo: Repository<TenantTypeOrmEntity>,
  ) {}

  async findAll(): Promise<TenantModel[]> {
    const records = await this.repo.find({ order: { name: 'ASC' } });
    return records.map(TenantMapper.toDomain);
  }

  async findOne(id: string): Promise<TenantModel | null> {
    const record = await this.repo.findOne({ where: { id } });
    return record ? TenantMapper.toDomain(record) : null;
  }

  async findBySlug(slug: string): Promise<TenantModel | null> {
    const record = await this.repo.findOne({ where: { slug } });
    return record ? TenantMapper.toDomain(record) : null;
  }

  async create(data: Partial<TenantModel>): Promise<TenantModel> {
    const entity = this.repo.create(data as any);
    const saved = await this.repo.save(entity);
    return TenantMapper.toDomain(saved as any);
  }

  async save(tenant: TenantModel): Promise<TenantModel> {
    const entity = TenantMapper.toPersistence(tenant);
    const saved = await this.repo.save(entity);
    return TenantMapper.toDomain(saved as any);
  }

  async softRemove(tenant: TenantModel): Promise<void> {
    const entity = TenantMapper.toPersistence(tenant);
    await this.repo.softRemove(entity);
  }
}
