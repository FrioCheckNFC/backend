import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem as Inventory } from './entities/inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async create(dto: CreateInventoryDto, tenantId: string): Promise<any> {
    const item = this.inventoryRepo.create({ ...dto, tenantId } as any);
    return this.inventoryRepo.save(item);
  }

  async findAll(tenantId: string): Promise<any[]> {
    return this.inventoryRepo.find({
      where: { tenantId },
      order: { partName: 'ASC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<any> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const item = await this.inventoryRepo.findOne({ where });
    if (!item) throw new NotFoundException(`Item con ID ${id} no encontrado`);
    return item;
  }

  async findLowStock(tenantId: string): Promise<any[]> {
    return this.inventoryRepo
      .createQueryBuilder('inventory')
      .where('inventory.tenant_id = :tenantId', { tenantId })
      .andWhere('inventory.quantity <= inventory.min_quantity')
      .orderBy('inventory.part_name', 'ASC')
      .getMany();
  }

  async update(id: string, dto: UpdateInventoryDto): Promise<any> {
    const item = await this.findById(id);
    Object.assign(item, dto);
    return this.inventoryRepo.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findById(id);
    await this.inventoryRepo.softRemove(item);
  }
}

