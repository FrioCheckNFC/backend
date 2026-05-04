import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SyncQueueService } from '../services/sync-queue.service';
import { CreateSyncQueueDto, UpdateSyncStatusDto } from '../dto/sync-queue.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/http/guards/roles.guard';
import { TenantGuard } from '../../auth/infrastructure/http/guards/tenant.guard';
import { Roles } from '../../auth/infrastructure/http/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sync-Queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('sync-queue')
export class SyncQueueController {
  constructor(private readonly syncQueueService: SyncQueueService) {}

  @Post()
  @ApiOperation({ summary: 'Encolar ítem para sincronización' })
  create(@Body() createSyncQueueDto: CreateSyncQueueDto, @Request() req) {
    return this.syncQueueService.create(createSyncQueueDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los ítems de la cola del tenant' })
  findAll(@Request() req) {
    return this.syncQueueService.findAll(req.user.tenantId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Listar ítems pendientes de sincronización' })
  findPending(@Request() req) {
    return this.syncQueueService.findPending(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ítem de sincronización por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.syncQueueService.findOne(id, req.user.tenantId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'Actualizar estado de sincronización (Solo Admin/System)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateSyncStatusDto: UpdateSyncStatusDto,
    @Request() req,
  ) {
    return this.syncQueueService.updateStatus(id, updateSyncStatusDto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar ítem de la cola (Solo Admin)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.syncQueueService.remove(id, req.user.tenantId);
  }
}
