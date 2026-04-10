import { SyncQueue } from '../entities/sync-queue.entity';

export interface SyncQueueRepositoryPort {
  findAll(tenantId: string): Promise<SyncQueue[]>;
  findById(id: string, tenantId: string): Promise<SyncQueue | null>;
  findPending(tenantId: string): Promise<SyncQueue[]>;
  create(item: Partial<SyncQueue>): Promise<SyncQueue>;
  save(item: SyncQueue): Promise<SyncQueue>;
  remove(item: SyncQueue): Promise<void>;
}
