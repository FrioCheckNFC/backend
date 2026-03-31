import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const item = this.inventoryRepository.create(createInventoryDto);
    return this.inventoryRepository.save(item);
  }

  async findAll(tenantId: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { tenantId },
      order: { partName: 'ASC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<Inventory> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const item = await this.inventoryRepository.findOne({ where });
    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return item;
  }

  async findLowStock(tenantId: string): Promise<Inventory[]> {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.tenant_id = :tenantId', { tenantId })
      .andWhere('inventory.quantity <= inventory.min_quantity')
      .orderBy('inventory.part_name', 'ASC')
      .getMany();
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const item = await this.findById(id);
    Object.assign(item, updateInventoryDto);
    return this.inventoryRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findById(id);
    await this.inventoryRepository.softRemove(item);
  }
}
