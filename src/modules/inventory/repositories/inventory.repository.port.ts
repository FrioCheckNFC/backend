import { InventoryItem } from '../entities/inventory.entity';

export interface InventoryRepositoryPort {
  findAll(tenantId: string): Promise<InventoryItem[]>;
  findLowStock(tenantId: string): Promise<InventoryItem[]>;
  findOne(id: string, tenantId: string): Promise<InventoryItem | null>;
  create(inventory: Partial<InventoryItem>): Promise<InventoryItem>;
  save(inventory: InventoryItem): Promise<InventoryItem>;
  softRemove(inventory: InventoryItem): Promise<void>;
}
