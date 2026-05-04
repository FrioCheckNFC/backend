import { MachineModel } from '../../../domain/models/machine.model';
import { MachineTypeOrmEntity } from '../entities/machine.typeorm.entity';

export class MachineMapper {
  static toDomain(entity: MachineTypeOrmEntity): MachineModel {
    return new MachineModel(
      entity.id,
      entity.tenantId,
      entity.assignedUserId || null,
      entity.storeId || null,
      entity.name || null,
      entity.latitude || null,
      entity.longitude || null,
      entity.brand || null,
      entity.model || null,
      entity.serialNumber || null,
      entity.status || null,
      entity.acquisitionType || null,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt || null,
    );
  }

  static toPersistence(domain: MachineModel): MachineTypeOrmEntity {
    const entity = new MachineTypeOrmEntity();
    entity.id = domain.id;
    entity.tenantId = domain.tenantId;
    entity.assignedUserId = domain.assignedUserId || undefined;
    entity.storeId = domain.storeId || undefined;
    entity.name = domain.name || '';
    entity.latitude = domain.latitude || undefined;
    entity.longitude = domain.longitude || undefined;
    entity.brand = domain.brand || undefined;
    entity.model = domain.model || undefined;
    entity.serialNumber = domain.serialNumber || undefined;
    entity.status = domain.status || undefined;
    entity.acquisitionType = domain.acquisitionType || undefined;
    entity.isActive = domain.isActive;
    
    // createdAt and updatedAt are usually handled by TypeORM implicitly when creating, 
    // but if we are updating, we can set them:
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    if (domain.deletedAt) entity.deletedAt = domain.deletedAt;

    return entity;
  }
}
