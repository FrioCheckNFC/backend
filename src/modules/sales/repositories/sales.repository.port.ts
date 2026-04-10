import { Sale } from '../entities/sale.entity';

export interface SalesRepositoryPort {
  findAll(tenantId: string): Promise<Sale[]>;
  findOne(id: string, tenantId: string): Promise<Sale | null>;
  create(sale: Partial<Sale>): Promise<Sale>;
  save(sale: Sale): Promise<Sale>;
  softRemove(sale: Sale): Promise<void>;
}
