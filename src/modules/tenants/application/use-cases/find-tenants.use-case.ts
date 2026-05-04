import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TenantRepositoryPort } from '../../domain/repositories/tenant.repository.port';
import { TenantModel } from '../../domain/models/tenant.model';

@Injectable()
export class FindTenantsUseCase {
  constructor(
    @Inject('TENANT_REPOSITORY')
    private readonly tenantRepository: TenantRepositoryPort,
  ) {}

  async findAll(): Promise<TenantModel[]> {
    return this.tenantRepository.findAll();
  }

  async findOne(id: string): Promise<TenantModel> {
    const tenant = await this.tenantRepository.findOne(id);
    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }
    return tenant;
  }
}
