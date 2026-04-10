import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreRepositoryPort } from './store.repository.port';
import { Store } from '../entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from '../dto/store.dto';

@Injectable()
export class TypeOrmStoreRepositoryAdapter implements StoreRepositoryPort {
  constructor(
    @InjectRepository(Store)
    private readonly repo: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto, tenantId: string): Promise<Store> {
    const store = this.repo.create({ ...dto, tenantId });
    return this.repo.save(store);
  }

  async findAll(tenantId: string): Promise<Store[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['sector', 'retailer', 'machines'],
    });
  }

  async findById(id: string, tenantId: string): Promise<Store | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['sector', 'retailer', 'machines'],
    });
  }

  async update(id: string, dto: UpdateStoreDto, tenantId: string): Promise<Store> {
    const store = await this.findById(id, tenantId);
    if (!store) throw new NotFoundException('Local no encontrado');
    Object.assign(store, dto);
    return this.repo.save(store);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const store = await this.findById(id, tenantId);
    if (!store) throw new NotFoundException('Local no encontrado');
    await this.repo.softRemove(store);
  }
}
