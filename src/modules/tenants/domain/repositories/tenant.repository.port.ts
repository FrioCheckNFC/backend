import { TenantModel } from '../models/tenant.model';

export interface TenantRepositoryPort {
  findAll(): Promise<TenantModel[]>;
  findOne(id: string): Promise<TenantModel | null>;
  findBySlug(slug: string): Promise<TenantModel | null>;
  create(data: Partial<TenantModel>): Promise<TenantModel>;
  save(tenant: TenantModel): Promise<TenantModel>;
  softRemove(tenant: TenantModel): Promise<void>;
}
