import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { FindTenantsUseCase } from '../../../application/use-cases/find-tenants.use-case';
import { CreateTenantUseCase } from '../../../application/use-cases/create-tenant.use-case';
import { UpdateTenantUseCase } from '../../../application/use-cases/update-tenant.use-case';
import { RemoveTenantUseCase } from '../../../application/use-cases/remove-tenant.use-case';

import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';

import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../auth/infrastructure/http/decorators/roles.decorator';

@ApiTags('Tenants (Empresas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly findTenantsUseCase: FindTenantsUseCase,
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly updateTenantUseCase: UpdateTenantUseCase,
    private readonly removeTenantUseCase: RemoveTenantUseCase,
  ) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo Tenant (Empresa)' })
  @ApiResponse({ status: 201, description: 'Tenant creado exitosamente' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.createTenantUseCase.execute(createTenantDto);
  }

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar todos los tenants' })
  @ApiResponse({ status: 200, description: 'Lista completa de tenants' })
  findAll() {
    return this.findTenantsUseCase.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener un tenant por ID' })
  @ApiResponse({ status: 200, description: 'Tenant encontrado' })
  @ApiResponse({ status: 404, description: 'Tenant no encontrado' })
  findOne(@Param('id') id: string) {
    return this.findTenantsUseCase.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar un tenant' })
  @ApiResponse({ status: 200, description: 'Tenant actualizado' })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.updateTenantUseCase.execute(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tenant (Soft Delete)' })
  @ApiResponse({ status: 204, description: 'Tenant eliminado' })
  remove(@Param('id') id: string) {
    return this.removeTenantUseCase.execute(id);
  }
}
