import { Tenant } from '../entities/tenant.entity';

export interface TenantRepositoryPort {
  findAll(): Promise<Tenant[]>;
  findOne(id: string): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  create(tenant: Partial<Tenant>): Promise<Tenant>;
  save(tenant: Tenant): Promise<Tenant>;
  softRemove(tenant: Tenant): Promise<void>;
}
