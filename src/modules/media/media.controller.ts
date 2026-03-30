// media.controller.ts
// Endpoints para gestionar archivos/fotos de evidencia.
// ADMIN y TECHNICIAN pueden subir y ver archivos.
// Solo ADMIN puede eliminar.

import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  // GET /api/v1/media?entityType=visit&entityId=uuid
  // Listar archivos de una entidad (ej: fotos de una visita)
  @Get()
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Listar archivos de una entidad (visita, ticket, equipo)' })
  @ApiQuery({ name: 'entityType', example: 'visit', description: 'Tipo: visit, ticket, asset' })
  @ApiQuery({ name: 'entityId', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Lista de archivos' })
  findByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Req() req,
  ) {
    return this.mediaService.findByEntity(entityType, entityId, req.user.tenantId);
  }

  // GET /api/v1/media/:id — Obtener metadatos de un archivo
  @Get(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Obtener metadatos de un archivo' })
  @ApiResponse({ status: 200, description: 'Archivo encontrado' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.mediaService.findOne(id, req.user.tenantId);
  }

  // POST /api/v1/media — Registrar un archivo subido
  @Post()
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Registrar metadatos de un archivo subido' })
  @ApiResponse({ status: 201, description: 'Archivo registrado' })
  create(@Body() dto: CreateMediaDto, @Req() req) {
    return this.mediaService.create(dto, req.user.id, req.user.tenantId);
  }

  // DELETE /api/v1/media/:id — Eliminar un archivo (soft delete, solo admin)
  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un archivo (soft delete)' })
  @ApiResponse({ status: 200, description: 'Archivo eliminado' })
  remove(@Param('id') id: string, @Req() req) {
    return this.mediaService.remove(id, req.user.tenantId);
  }
}
