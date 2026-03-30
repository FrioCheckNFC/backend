// assets.controller.ts
// Endpoints para gestionar equipos de refrigeracion.
// ADMIN: CRUD completo. TECHNICIAN: solo puede buscar por NFC (cuando escanea en terreno).
// El tenantId siempre viene del token JWT (no del body).

import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  // GET /api/v1/assets — Listar equipos de mi tenant
  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar equipos de refrigeracion de mi empresa' })
  @ApiResponse({ status: 200, description: 'Lista de equipos' })
  findAll(@Req() req) {
    return this.assetsService.findAll(req.user.tenantId);
  }

  // GET /api/v1/assets/nfc/:nfcTagId — Buscar equipo por tag NFC (para tecnicos)
  @Get('nfc/:nfcTagId')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Buscar equipo por tag NFC (escaneo en terreno)' })
  @ApiResponse({ status: 200, description: 'Equipo encontrado' })
  @ApiResponse({ status: 404, description: 'Tag NFC no encontrado' })
  findByNfc(@Param('nfcTagId') nfcTagId: string, @Req() req) {
    return this.assetsService.findByNfc(nfcTagId, req.user.tenantId);
  }

  // GET /api/v1/assets/:id — Obtener un equipo por ID
  @Get(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Obtener un equipo por ID' })
  @ApiResponse({ status: 200, description: 'Equipo encontrado' })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.assetsService.findOne(id, req.user.tenantId);
  }

  // POST /api/v1/assets — Crear un equipo nuevo
  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Registrar un equipo de refrigeracion nuevo' })
  @ApiResponse({ status: 201, description: 'Equipo creado' })
  create(@Body() dto: CreateAssetDto, @Req() req) {
    return this.assetsService.create(dto, req.user.tenantId);
  }

  // PUT /api/v1/assets/:id — Actualizar un equipo
  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un equipo' })
  @ApiResponse({ status: 200, description: 'Equipo actualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto, @Req() req) {
    return this.assetsService.update(id, dto, req.user.tenantId);
  }

  // DELETE /api/v1/assets/:id — Eliminar un equipo (soft delete)
  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un equipo (soft delete)' })
  @ApiResponse({ status: 200, description: 'Equipo eliminado' })
  remove(@Param('id') id: string, @Req() req) {
    return this.assetsService.remove(id, req.user.tenantId);
  }
}
