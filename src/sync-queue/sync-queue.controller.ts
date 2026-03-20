import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SyncQueueService } from './sync-queue.service';
import { CreateSyncQueueDto, UpdateSyncQueueDto } from './dto/sync-queue.dto';

@Controller('sync-queue')
export class SyncQueueController {
  constructor(private readonly syncQueueService: SyncQueueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  enqueue(@Body() createSyncQueueDto: CreateSyncQueueDto) {
    return this.syncQueueService.enqueue(createSyncQueueDto);
  }

  @Get('pending')
  getPendingOperations(@Query('tenantId') tenantId: string) {
    return this.syncQueueService.getPendingOperations(tenantId);
  }

  @Get('retry-needed')
  getOperationsForRetry() {
    return this.syncQueueService.getOperationsForRetry();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.syncQueueService.findById(id);
  }

  @Post(':id/mark-synced')
  @HttpCode(HttpStatus.OK)
  markAsSynced(
    @Param('id') id: string,
    @Body() body: { entityId?: string; entityType?: string },
  ) {
    return this.syncQueueService.markAsSynced(id, body.entityId, body.entityType);
  }

  @Post(':id/mark-failed')
  @HttpCode(HttpStatus.OK)
  markAsFailed(
    @Param('id') id: string,
    @Body() body: { error: string; stackTrace?: string },
  ) {
    return this.syncQueueService.markAsFailed(id, body.error, body.stackTrace);
  }

  @Get('stats/:tenantId')
  getSyncStats(@Param('tenantId') tenantId: string) {
    return this.syncQueueService.getSyncStats(tenantId);
  }
}
