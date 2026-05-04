import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TenantRepositoryPort } from '../../domain/repositories/tenant.repository.port';

@Injectable()
export class RemoveTenantUseCase {
  constructor(
    @Inject('TENANT_REPOSITORY')
    private readonly tenantRepository: TenantRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const tenant = await this.tenantRepository.findOne(id);
    if (!tenant) throw new NotFoundException('Tenant no encontrado');
    await this.tenantRepository.softRemove(tenant);
  }
}
