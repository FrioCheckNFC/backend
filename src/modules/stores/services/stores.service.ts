import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreRepositoryPort } from '../repositories/store.repository.port';
import { CreateStoreDto, UpdateStoreDto } from '../dto/store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly storeRepository: StoreRepositoryPort) {}

  async create(dto: CreateStoreDto, tenantId: string) {
    return this.storeRepository.create(dto, tenantId);
  }

  async findAll(tenantId: string) {
    return this.storeRepository.findAll(tenantId);
  }

  async findOne(id: string, tenantId: string) {
    const store = await this.storeRepository.findById(id, tenantId);
    if (!store) throw new NotFoundException('Local no encontrado');
    return store;
  }

  async update(id: string, dto: UpdateStoreDto, tenantId: string) {
    return this.storeRepository.update(id, dto, tenantId);
  }

  async remove(id: string, tenantId: string) {
    return this.storeRepository.remove(id, tenantId);
  }
}
