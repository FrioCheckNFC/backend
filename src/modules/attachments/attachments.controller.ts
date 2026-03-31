// attachments.controller.ts
// Endpoints para gestionar archivos/fotos de evidencia.
// ADMIN y TECHNICIAN pueden subir y ver archivos.
// Solo ADMIN puede eliminar.

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Attachments')
@ApiBearerAuth()
@Controller('attachments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Get()
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({
    summary: 'Listar archivos de una entidad (visita, ticket, máquina)',
  })
  @ApiQuery({
    name: 'entityType',
    example: 'visit',
    description: 'Tipo: visit, ticket, machine',
  })
  @ApiQuery({
    name: 'entityId',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Lista de archivos' })
  findByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Req() req,
  ) {
    return this.attachmentsService.findByEntity(
      entityType,
      entityId,
      req.user.tenantId,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Obtener metadatos de un archivo' })
  @ApiResponse({ status: 200, description: 'Archivo encontrado' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.attachmentsService.findOne(id, req.user.tenantId);
  }

  @Post()
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Registrar metadatos de un archivo subido' })
  @ApiResponse({ status: 201, description: 'Archivo registrado' })
  create(@Body() dto: CreateAttachmentDto, @Req() req) {
    return this.attachmentsService.create(dto, req.user.id, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un archivo (soft delete)' })
  @ApiResponse({ status: 200, description: 'Archivo eliminado' })
  remove(@Param('id') id: string, @Req() req) {
    return this.attachmentsService.remove(id, req.user.tenantId);
  }
}
