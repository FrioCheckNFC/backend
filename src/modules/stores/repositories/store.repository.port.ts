import { Store } from '../entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from '../dto/store.dto';

export abstract class StoreRepositoryPort {
  abstract create(dto: CreateStoreDto, tenantId: string): Promise<Store>;
  abstract findAll(tenantId: string): Promise<Store[]>;
  abstract findById(id: string, tenantId: string): Promise<Store | null>;
  abstract update(id: string, dto: UpdateStoreDto, tenantId: string): Promise<Store>;
  abstract remove(id: string, tenantId: string): Promise<void>;
}
