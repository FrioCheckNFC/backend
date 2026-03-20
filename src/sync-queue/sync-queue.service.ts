import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SyncQueue, SyncStatus, SyncOperationType } from './entities/sync-queue.entity';
import { CreateSyncQueueDto, UpdateSyncQueueDto } from './dto/sync-queue.dto';

@Injectable()
export class SyncQueueService {
  constructor(
    @InjectRepository(SyncQueue)
    private readonly syncQueueRepository: Repository<SyncQueue>,
  ) {}

  // Encolar una operación offline
  async enqueue(createSyncQueueDto: CreateSyncQueueDto): Promise<SyncQueue> {
    const syncItem = this.syncQueueRepository.create({
      ...createSyncQueueDto,
      status: SyncStatus.PENDIENTE,
      retryCount: 0,
    });

    return this.syncQueueRepository.save(syncItem);
  }

  // Obtener operaciones pendientes para sincronizar
  async getPendingOperations(tenantId: string): Promise<SyncQueue[]> {
    return this.syncQueueRepository.find({
      where: {
        tenant: { id: tenantId },
        status: SyncStatus.PENDIENTE,
      },
      relations: ['user', 'tenant'],
      order: { createdAt: 'ASC' },
    });
  }

  // Obtener operaciones que necesitan reintento
  async getOperationsForRetry(): Promise<SyncQueue[]> {
    const now = new Date();
    return this.syncQueueRepository.find({
      where: {
        status: SyncStatus.FALLIDO,
        nextRetryAt: LessThan(now),
      },
      relations: ['user', 'tenant'],
      order: { nextRetryAt: 'ASC' },
    });
  }

  // Marcar como sincronizado
  async markAsSynced(id: string, entityId?: string, entityType?: string): Promise<SyncQueue> {
    const syncItem = await this.findById(id);

    syncItem.status = SyncStatus.SINCRONIZADO;
    syncItem.syncedAt = new Date();

    if (entityId) syncItem.entityId = entityId;
    if (entityType) syncItem.entityType = entityType;

    return this.syncQueueRepository.save(syncItem);
  }

  // Registrar error y programar reintento
  async markAsFailed(
    id: string,
    error: Error | string,
    stackTrace?: string,
  ): Promise<SyncQueue> {
    const syncItem = await this.findById(id);

    syncItem.retryCount += 1;
    syncItem.errorMessage = typeof error === 'string' ? error : error.message;
    syncItem.errorStack = stackTrace || '';

    if (syncItem.retryCount >= syncItem.maxRetries) {
      syncItem.status = SyncStatus.REVISION_MANUAL;
    } else {
      syncItem.status = SyncStatus.FALLIDO;
      // Programar siguiente intento (exponential backoff: 60s, 300s, 900s)
      const delays = [60, 300, 900];
      const delaySeconds = delays[Math.min(syncItem.retryCount - 1, 2)];
      const nextRetry = new Date();
      nextRetry.setSeconds(nextRetry.getSeconds() + delaySeconds);
      syncItem.nextRetryAt = nextRetry;
    }

    return this.syncQueueRepository.save(syncItem);
  }

  async findById(id: string): Promise<SyncQueue> {
    const syncItem = await this.syncQueueRepository.findOne({
      where: { id },
      relations: ['user', 'tenant'],
    });

    if (!syncItem) {
      throw new NotFoundException(`SyncQueue item with ID ${id} not found`);
    }

    return syncItem;
  }

  // Obtener estadísticas de sincronización
  async getSyncStats(tenantId: string): Promise<any> {
    const pending = await this.syncQueueRepository.count({
      where: { tenant: { id: tenantId }, status: SyncStatus.PENDIENTE },
    });

    const synced = await this.syncQueueRepository.count({
      where: { tenant: { id: tenantId }, status: SyncStatus.SINCRONIZADO },
    });

    const failed = await this.syncQueueRepository.count({
      where: { tenant: { id: tenantId }, status: SyncStatus.FALLIDO },
    });

    const manualReview = await this.syncQueueRepository.count({
      where: { tenant: { id: tenantId }, status: SyncStatus.REVISION_MANUAL },
    });

    return { pending, synced, failed, manualReview };
  }
}
