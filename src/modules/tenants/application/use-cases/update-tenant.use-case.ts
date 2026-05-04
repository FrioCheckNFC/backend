import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantRepositoryPort } from '../../domain/repositories/tenant.repository.port';
import { TenantModel } from '../../domain/models/tenant.model';
import { UpdateTenantDto } from '../../infrastructure/http/dto/update-tenant.dto';

@Injectable()
export class UpdateTenantUseCase {
  constructor(
    @Inject('TENANT_REPOSITORY')
    private readonly tenantRepository: TenantRepositoryPort,
  ) {}

  async execute(id: string, dto: UpdateTenantDto): Promise<TenantModel> {
    const tenant = await this.tenantRepository.findOne(id);
    if (!tenant) throw new NotFoundException('Tenant no encontrado');

    if (dto.slug && dto.slug !== tenant.slug) {
      const slugTaken = await this.tenantRepository.findBySlug(dto.slug);
      if (slugTaken) {
        throw new BadRequestException('Ese slug ya esta en uso');
      }
    }

    Object.assign(tenant, dto);
    return this.tenantRepository.save(tenant);
  }
}
