// tenants.module.ts
// Modulo que agrupa todo lo relacionado con tenants.
// Importa TypeOrmModule para tener acceso al repositorio de la tabla tenants.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantsService } from './services/tenants.service';
import { TenantsController } from './controllers/tenants.controller';
import { TypeOrmTenantRepositoryAdapter } from './repositories/typeorm-tenant.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantsController],
  providers: [
    TenantsService,
    {
      provide: 'TENANT_REPOSITORY',
      useClass: TypeOrmTenantRepositoryAdapter,
    },
  ],
  exports: [TenantsService, 'TENANT_REPOSITORY'],
})
export class TenantsModule {}
