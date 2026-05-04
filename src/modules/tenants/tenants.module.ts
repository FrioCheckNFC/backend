import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantTypeOrmEntity } from './infrastructure/database/entities/tenant.typeorm.entity';
import { TypeormTenantRepositoryAdapter } from './infrastructure/database/repositories/typeorm-tenant.repository.adapter';

import { TenantsController } from './infrastructure/http/controllers/tenants.controller';

import { FindTenantsUseCase } from './application/use-cases/find-tenants.use-case';
import { CreateTenantUseCase } from './application/use-cases/create-tenant.use-case';
import { UpdateTenantUseCase } from './application/use-cases/update-tenant.use-case';
import { RemoveTenantUseCase } from './application/use-cases/remove-tenant.use-case';

const useCases = [
  FindTenantsUseCase,
  CreateTenantUseCase,
  UpdateTenantUseCase,
  RemoveTenantUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([TenantTypeOrmEntity])],
  controllers: [TenantsController],
  providers: [
    ...useCases,
    {
      provide: 'TENANT_REPOSITORY',
      useClass: TypeormTenantRepositoryAdapter,
    },
    // Keep TenantsService alive TEMPORARILY purely to not break AuthUseCase dependencies that might inject it until we fix it 100%
  ],
  exports: [
    ...useCases,
    'TENANT_REPOSITORY',
  ],
})
export class TenantsModule {}
