import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncQueue, SyncStatus } from '../entities/sync-queue.entity';
import { SyncQueueRepositoryPort } from './sync-queue.repository.port';

@Injectable()
export class TypeOrmSyncQueueRepositoryAdapter implements SyncQueueRepositoryPort {
  constructor(
    @InjectRepository(SyncQueue)
    private readonly repo: Repository<SyncQueue>,
  ) {}

  async findAll(tenantId: string): Promise<SyncQueue[]> {
    return this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, tenantId: string): Promise<SyncQueue | null> {
    return this.repo.findOne({
      where: { id, tenantId },
    });
  }

  async findPending(tenantId: string): Promise<SyncQueue[]> {
    return this.repo.find({
      where: { tenantId, status: SyncStatus.PENDIENTE },
      order: { createdAt: 'ASC' },
    });
  }

  async create(item: Partial<SyncQueue>): Promise<SyncQueue> {
    const newItem = this.repo.create(item);
    return this.repo.save(newItem);
  }

  async save(item: SyncQueue): Promise<SyncQueue> {
    return this.repo.save(item);
  }

  async remove(item: SyncQueue): Promise<void> {
    await this.repo.remove(item);
  }
}
