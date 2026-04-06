// machines.controller.ts
// Endpoints para gestionar máquinas/equipos de refrigeración.
// ADMIN: CRUD completo. TECHNICIAN: solo puede buscar por NFC (cuando escanea en terreno).
// El tenantId siempre viene del token JWT (no del body).

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
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { ScanMachineDto } from './dto/scan-machine.dto';
import { NfcReadDto } from './dto/nfc-read.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Machines')
@ApiBearerAuth()
@Controller('machines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MachinesController {
  constructor(private machinesService: MachinesService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar máquinas de mi empresa' })
  @ApiResponse({ status: 200, description: 'Lista de máquinas' })
  findAll(@Req() req) {
    return this.machinesService.findAll(req.user.tenantId);
  }

  @Post('scan')
  @Roles('ADMIN', 'TECHNICIAN', 'VENDOR')
  @ApiOperation({ summary: 'Escanear y validar NFC + GPS de una máquina' })
  @ApiResponse({ status: 200, description: 'Resultado de la validación' })
  scan(@Body() dto: ScanMachineDto, @Req() req) {
    return this.machinesService.scan(dto, req.user.tenantId);
  }

  @Post('read')
  @Roles('ADMIN', 'TECHNICIAN', 'VENDOR')
  @ApiOperation({
    summary: 'Leer tag NFC y obtener información viva del activo',
  })
  @ApiResponse({ status: 200, description: 'Información del activo' })
  nfcRead(@Body() dto: NfcReadDto, @Req() req) {
    return this.machinesService.nfcRead(dto, req.user.tenantId, req.user.role);
  }

  @Get('nfc/:nfcTagId')
  @Roles('ADMIN', 'TECHNICIAN', 'VENDOR')
  @ApiOperation({ summary: 'Buscar máquina por tag NFC (escaneo en terreno)' })
  @ApiResponse({ status: 200, description: 'Máquina encontrada' })
  @ApiResponse({ status: 404, description: 'Tag NFC no encontrado' })
  findByNfc(@Param('nfcTagId') nfcTagId: string, @Req() req) {
    return this.machinesService.findByNfc(nfcTagId, req.user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'TECHNICIAN', 'VENDOR')
  @ApiOperation({ summary: 'Obtener una máquina por ID' })
  @ApiResponse({ status: 200, description: 'Máquina encontrada' })
  @ApiResponse({ status: 404, description: 'Máquina no encontrada' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.machinesService.findOne(id, req.user.tenantId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Registrar una máquina nueva' })
  @ApiResponse({ status: 201, description: 'Máquina creada' })
  create(@Body() dto: CreateMachineDto, @Req() req) {
    return this.machinesService.create(dto, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una máquina' })
  @ApiResponse({ status: 200, description: 'Máquina actualizada' })
  update(@Param('id') id: string, @Body() dto: UpdateMachineDto, @Req() req) {
    return this.machinesService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una máquina (soft delete)' })
  @ApiResponse({ status: 200, description: 'Máquina eliminada' })
  remove(@Param('id') id: string, @Req() req) {
    return this.machinesService.remove(id, req.user.tenantId);
  }
}
