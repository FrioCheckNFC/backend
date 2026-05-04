import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { TenantRepositoryPort } from '../../domain/repositories/tenant.repository.port';
import { TenantModel } from '../../domain/models/tenant.model';
import { CreateTenantDto } from '../../infrastructure/http/dto/create-tenant.dto';

@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject('TENANT_REPOSITORY')
    private readonly tenantRepository: TenantRepositoryPort,
  ) {}

  async execute(dto: CreateTenantDto): Promise<TenantModel> {
    const exists = await this.tenantRepository.findBySlug(dto.slug);
    if (exists) {
      throw new BadRequestException('Ya existe un tenant con ese slug');
    }
    return this.tenantRepository.create(dto);
  }
}
