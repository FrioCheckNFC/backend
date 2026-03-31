// tenants.controller.ts
// Endpoints HTTP para gestionar tenants (empresas).
// FIX #5: Solo rol SUPPORT (super-admin interno) puede gestionar tenants.
// Un ADMIN normal solo puede ver y gestionar los recursos de SU tenant.
// Nunca debe ver ni crear tenants de otras empresas.

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  // GET /api/v1/tenants — Solo SUPPORT ve todos los tenants
  @Get()
  @Roles('SUPPORT')
  @ApiOperation({ summary: '[SUPPORT] Listar todos los tenants del sistema' })
  @ApiResponse({ status: 200, description: 'Lista de tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }

  // GET /api/v1/tenants/:id
  @Get(':id')
  @Roles('SUPPORT')
  @ApiOperation({ summary: '[SUPPORT] Obtener un tenant por ID' })
  @ApiResponse({ status: 200, description: 'Tenant encontrado' })
  @ApiResponse({ status: 404, description: 'Tenant no encontrado' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  // POST /api/v1/tenants — Crear un tenant nuevo
  @Post()
  @Roles('SUPPORT')
  @ApiOperation({ summary: '[SUPPORT] Crear un tenant nuevo' })
  @ApiResponse({ status: 201, description: 'Tenant creado' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  // PATCH /api/v1/tenants/:id — Actualizar un tenant
  @Patch(':id')
  @Roles('SUPPORT')
  @ApiOperation({ summary: '[SUPPORT] Actualizar un tenant' })
  @ApiResponse({ status: 200, description: 'Tenant actualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  // DELETE /api/v1/tenants/:id — Eliminar un tenant (soft delete)
  @Delete(':id')
  @Roles('SUPPORT')
  @ApiOperation({ summary: '[SUPPORT] Eliminar un tenant (soft delete)' })
  @ApiResponse({ status: 200, description: 'Tenant eliminado' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
