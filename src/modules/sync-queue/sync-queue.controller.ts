import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SyncQueueService } from './sync-queue.service';
import { CreateSyncQueueDto } from './dto/sync-queue.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@ApiTags('Sync Queue')
@Controller('sync-queue')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class SyncQueueController {
  constructor(private readonly syncQueueService: SyncQueueService) {}

  @Post()
  @RequireRoles('ADMIN', 'TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER')
  @HttpCode(HttpStatus.CREATED)
  enqueue(@Body() createSyncQueueDto: CreateSyncQueueDto) {
    return this.syncQueueService.enqueue(createSyncQueueDto);
  }

  @Get('stats')
  @RequireRoles('ADMIN')
  getSyncStats(@CurrentTenant() tenantId: string) {
    return this.syncQueueService.getSyncStats(tenantId);
  }

  @Get('pending')
  @RequireRoles('ADMIN', 'TECHNICIAN')
  getPendingOperations(@CurrentTenant() tenantId: string) {
    return this.syncQueueService.getPendingOperations(tenantId);
  }

  @Get('retry-needed')
  @RequireRoles('ADMIN')
  getOperationsForRetry() {
    return this.syncQueueService.getOperationsForRetry();
  }

  @Get(':id')
  @RequireRoles('ADMIN', 'TECHNICIAN')
  findById(@Param('id') id: string) {
    return this.syncQueueService.findById(id);
  }

  @Post(':id/mark-synced')
  @RequireRoles('ADMIN', 'TECHNICIAN')
  @HttpCode(HttpStatus.OK)
  markAsSynced(
    @Param('id') id: string,
    @Body() body: { entityId?: string; entityType?: string },
  ) {
    return this.syncQueueService.markAsSynced(id, body.entityId, body.entityType);
  }

  @Post(':id/mark-failed')
  @RequireRoles('ADMIN', 'TECHNICIAN')
  @HttpCode(HttpStatus.OK)
  markAsFailed(
    @Param('id') id: string,
    @Body() body: { error: string; stackTrace?: string },
  ) {
    return this.syncQueueService.markAsFailed(id, body.error, body.stackTrace);
  }
}
