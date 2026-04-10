import { Merma } from '../entities/merma.entity';

export interface MermaRepositoryPort {
  findAll(tenantId: string): Promise<Merma[]>;
  findById(id: string, tenantId?: string): Promise<Merma | null>;
  create(merma: Partial<Merma>): Promise<Merma>;
  save(merma: Merma): Promise<Merma>;
  softRemove(merma: Merma): Promise<void>;
  getStats(tenantId: string): Promise<any>;
  getStatsByProduct(tenantId: string): Promise<any[]>;
}
