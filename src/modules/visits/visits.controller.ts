// visits.controller.ts
// Endpoints de visitas.
// ADMIN: ve todas las visitas de su tenant.
// TECHNICIAN: crea visitas y ve solo las suyas.

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Visits')
@ApiBearerAuth()
@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitsController {
  constructor(private visitsService: VisitsService) {}

  // GET /api/v1/visits — ADMIN ve todas las visitas del tenant
  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todas las visitas de mi empresa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de visitas con tecnico y equipo',
  })
  findAll(@Req() req) {
    return this.visitsService.findAll(req.user.tenantId);
  }

  // GET /api/v1/visits/my — TECHNICIAN ve solo sus visitas
  @Get('my')
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Listar mis visitas (solo tecnico)' })
  @ApiResponse({ status: 200, description: 'Lista de mis visitas' })
  findMine(@Req() req) {
    return this.visitsService.findByTechnician(req.user.id, req.user.tenantId);
  }

  // GET /api/v1/visits/:id — Detalle de una visita
  @Get(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Obtener detalle de una visita' })
  @ApiResponse({ status: 200, description: 'Visita encontrada' })
  @ApiResponse({ status: 404, description: 'Visita no encontrada' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.visitsService.findOne(id, req.user.tenantId);
  }

  // POST /api/v1/visits — Tecnico crea una visita
  @Post()
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Registrar una visita a un equipo' })
  @ApiResponse({ status: 201, description: 'Visita registrada' })
  create(@Body() dto: CreateVisitDto, @Req() req) {
    return this.visitsService.create(dto, req.user.id, req.user.tenantId);
  }

  // PATCH /api/v1/visits/:id — Corregir una visita
  // FIX #6: se pasa el id y roles del requester para verificar ownership en el service
  @Patch(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({
    summary: 'Corregir datos de una visita (tecnico solo las suyas)',
  })
  @ApiResponse({ status: 200, description: 'Visita actualizada' })
  update(@Param('id') id: string, @Body() dto: UpdateVisitDto, @Req() req) {
    return this.visitsService.update(
      id,
      dto,
      req.user.tenantId,
      req.user.id,
      req.user.roles,
    );
  }

  // DELETE /api/v1/visits/:id — Eliminar una visita (soft delete, solo admin)
  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una visita (soft delete)' })
  @ApiResponse({ status: 200, description: 'Visita eliminada' })
  remove(@Param('id') id: string, @Req() req) {
    return this.visitsService.remove(id, req.user.tenantId);
  }
}
