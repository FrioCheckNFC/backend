// tickets.controller.ts
// Endpoints de tickets/ordenes de trabajo.
// ADMIN: CRUD completo + asignar tecnicos.
// TECHNICIAN: crear tickets y ver los asignados.

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
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  // GET /api/v1/tickets — ADMIN ve todos los tickets del tenant
  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos los tickets de mi empresa' })
  @ApiResponse({ status: 200, description: 'Lista de tickets' })
  findAll(@Req() req) {
    return this.ticketsService.findAll(req.user.tenantId);
  }

  // GET /api/v1/tickets/my — TECHNICIAN ve sus tickets asignados
  @Get('my')
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Listar mis tickets asignados (solo tecnico)' })
  @ApiResponse({ status: 200, description: 'Lista de tickets asignados a mi' })
  findMine(@Req() req) {
    return this.ticketsService.findByAssignee(req.user.id, req.user.tenantId);
  }

  // GET /api/v1/tickets/:id — Detalle de un ticket
  @Get(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Obtener detalle de un ticket' })
  @ApiResponse({ status: 200, description: 'Ticket encontrado' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.ticketsService.findOne(id, req.user.tenantId);
  }

  // POST /api/v1/tickets — Crear un ticket (admin o tecnico)
  @Post()
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Crear un ticket/orden de trabajo' })
  @ApiResponse({ status: 201, description: 'Ticket creado' })
  create(@Body() dto: CreateTicketDto, @Req() req) {
    return this.ticketsService.create(dto, req.user.id, req.user.tenantId);
  }

  // PATCH /api/v1/tickets/:id — Actualizar un ticket (admin asigna, tecnico cambia estado)
  @Patch(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Actualizar un ticket' })
  @ApiResponse({ status: 200, description: 'Ticket actualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto, @Req() req) {
    return this.ticketsService.update(id, dto, req.user.tenantId);
  }

  // DELETE /api/v1/tickets/:id — Eliminar un ticket (soft delete, solo admin)
  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un ticket (soft delete)' })
  @ApiResponse({ status: 200, description: 'Ticket eliminado' })
  remove(@Param('id') id: string, @Req() req) {
    return this.ticketsService.remove(id, req.user.tenantId);
  }
}
