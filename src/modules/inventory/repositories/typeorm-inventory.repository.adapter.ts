import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../entities/inventory.entity';
import { InventoryRepositoryPort } from './inventory.repository.port';

@Injectable()
export class TypeOrmInventoryRepositoryAdapter implements InventoryRepositoryPort {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly repo: Repository<InventoryItem>,
  ) {}

  async findAll(tenantId: string): Promise<InventoryItem[]> {
    return this.repo.find({
      where: { tenantId },
      order: { partName: 'ASC' },
    });
  }

  async findLowStock(tenantId: string): Promise<InventoryItem[]> {
    return this.repo
      .createQueryBuilder('inventory')
      .where('inventory.tenantId = :tenantId', { tenantId })
      .andWhere('inventory.quantity <= inventory.minQuantity')
      .orderBy('inventory.partName', 'ASC')
      .getMany();
  }

  async findOne(id: string, tenantId: string): Promise<InventoryItem | null> {
    return this.repo.findOne({
      where: { id, tenantId },
    });
  }

  async create(inventory: Partial<InventoryItem>): Promise<InventoryItem> {
    const newItem = this.repo.create(inventory);
    return this.repo.save(newItem);
  }

  async save(inventory: InventoryItem): Promise<InventoryItem> {
    return this.repo.save(inventory);
  }

  async softRemove(inventory: InventoryItem): Promise<void> {
    await this.repo.softRemove(inventory);
  }
}
