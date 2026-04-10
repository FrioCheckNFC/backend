import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InventoryItem, InventoryStatus } from '../entities/inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto } from '../dto/inventory.dto';
import { InventoryRepositoryPort } from '../repositories/inventory.repository.port';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('INVENTORY_REPOSITORY')
    private readonly inventoryRepository: InventoryRepositoryPort,
  ) {}

  async create(dto: CreateInventoryDto, tenantId: string): Promise<InventoryItem> {
    const status = dto.quantity === 0 ? InventoryStatus.AGOTADO : InventoryStatus.DISPONIBLE;
    return this.inventoryRepository.create({ ...dto, tenantId, status });
  }

  async findAll(tenantId: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.findAll(tenantId);
  }

  async findLowStock(tenantId: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.findLowStock(tenantId);
  }

  async findOne(id: string, tenantId: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne(id, tenantId);
    if (!item) {
      throw new NotFoundException(`Item de inventario con ID ${id} no encontrado`);
    }
    return item;
  }

  async update(id: string, dto: UpdateInventoryDto, tenantId: string): Promise<InventoryItem> {
    const item = await this.findOne(id, tenantId);
    Object.assign(item, dto);

    // Actualizar status automaticamente si la cantidad es 0
    if (item.quantity === 0) {
      item.status = InventoryStatus.AGOTADO;
    } else if (item.status === InventoryStatus.AGOTADO && item.quantity > 0) {
      item.status = InventoryStatus.DISPONIBLE;
    }

    return this.inventoryRepository.save(item);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const item = await this.findOne(id, tenantId);
    await this.inventoryRepository.softRemove(item);
  }
}
