import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { SyncQueue, SyncStatus } from '../entities/sync-queue.entity';
import { CreateSyncQueueDto, UpdateSyncStatusDto } from '../dto/sync-queue.dto';
import { SyncQueueRepositoryPort } from '../repositories/sync-queue.repository.port';

@Injectable()
export class SyncQueueService {
  constructor(
    @Inject('SYNC_QUEUE_REPOSITORY')
    private readonly syncQueueRepository: SyncQueueRepositoryPort,
  ) {}

  async create(dto: CreateSyncQueueDto, tenantId: string): Promise<SyncQueue> {
    const item = await this.syncQueueRepository.create({
      ...dto,
      tenantId,
      status: SyncStatus.PENDIENTE,
      retryCount: 0,
    });
    return this.syncQueueRepository.save(item);
  }

  async findAll(tenantId: string): Promise<SyncQueue[]> {
    return this.syncQueueRepository.findAll(tenantId);
  }

  async findPending(tenantId: string): Promise<SyncQueue[]> {
    return this.syncQueueRepository.findPending(tenantId);
  }

  async findOne(id: string, tenantId: string): Promise<SyncQueue> {
    const item = await this.syncQueueRepository.findById(id, tenantId);
    if (!item) {
      throw new NotFoundException(`Ítem de sincronización con ID ${id} no encontrado`);
    }
    return item;
  }

  async updateStatus(
    id: string,
    dto: UpdateSyncStatusDto,
    tenantId: string,
  ): Promise<SyncQueue> {
    const item = await this.findOne(id, tenantId);
    if (dto.status) item.status = dto.status;
    if (dto.errorMessage) item.errorMessage = dto.errorMessage;
    if (dto.status === SyncStatus.FALLIDO) item.retryCount++;
    return this.syncQueueRepository.save(item);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const item = await this.findOne(id, tenantId);
    await this.syncQueueRepository.remove(item);
  }
}
