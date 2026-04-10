import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { Tenant } from '../entities/tenant.entity';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { TenantRepositoryPort } from '../repositories/tenant.repository.port';

@Injectable()
export class TenantsService {
  constructor(
    @Inject('TENANT_REPOSITORY')
    private readonly tenantRepository: TenantRepositoryPort,
  ) {}

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.findAll();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne(id);
    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }
    return tenant;
  }

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const exists = await this.tenantRepository.findBySlug(dto.slug);
    if (exists) {
      throw new BadRequestException('Ya existe un tenant con ese slug');
    }

    return this.tenantRepository.create(dto);
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    if (dto.slug && dto.slug !== tenant.slug) {
      const slugTaken = await this.tenantRepository.findBySlug(dto.slug);
      if (slugTaken) {
        throw new BadRequestException('Ese slug ya esta en uso');
      }
    }

    Object.assign(tenant, dto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.softRemove(tenant);
  }
}
