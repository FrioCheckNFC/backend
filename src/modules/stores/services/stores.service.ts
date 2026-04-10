import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreRepositoryPort } from '../repositories/store.repository.port';
import { CreateStoreDto, UpdateStoreDto } from '../dto/store.dto';
import { SectorsService } from '../../sectors/services/sectors.service';

@Injectable()
export class StoresService {
  constructor(
    private readonly storeRepository: StoreRepositoryPort,
    private readonly sectorsService: SectorsService,
  ) {}

  async create(dto: CreateStoreDto, tenantId: string) {
    if (!dto.sectorId && dto.address) {
      dto.sectorId = await this.autoDetectSector(dto.address, tenantId);
    }
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
    if (!dto.sectorId && dto.address) {
      dto.sectorId = await this.autoDetectSector(dto.address, tenantId);
    }
    return this.storeRepository.update(id, dto, tenantId);
  }

  private async autoDetectSector(
    address: string,
    tenantId: string,
  ): Promise<string | undefined> {
    try {
      // Formato esperado: "Calle Numero, Comuna, Ciudad"
      const parts = address.split(',').map((p) => p.trim());
      if (parts.length < 2) return undefined;

      // Asumimos que la penúltima parte es la comuna y la última es la ciudad
      const comuna = parts[parts.length - 2];
      const city = parts[parts.length - 1];

      if (!comuna || !city) return undefined;

      const sector = await this.sectorsService.findOrCreateByGeography(
        comuna,
        city,
        tenantId,
      );
      return sector.id;
    } catch (error) {
      console.error('Error autodetecting sector:', error);
      return undefined;
    }
  }

  async remove(id: string, tenantId: string) {
    return this.storeRepository.remove(id, tenantId);
  }
}
