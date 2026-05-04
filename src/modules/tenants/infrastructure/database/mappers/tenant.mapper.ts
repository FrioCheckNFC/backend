import { TenantModel } from '../../../domain/models/tenant.model';
import { TenantTypeOrmEntity } from '../entities/tenant.typeorm.entity';

export class TenantMapper {
  static toDomain(entity: TenantTypeOrmEntity): TenantModel {
    const model = new TenantModel();
    model.id = entity.id;
    model.name = entity.name;
    model.slug = entity.slug;
    model.description = entity.description;
    model.logoUrl = entity.logoUrl;
    model.isActive = entity.isActive;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    model.deletedAt = entity.deletedAt;
    return model;
  }

  static toPersistence(domain: TenantModel): TenantTypeOrmEntity {
    const entity = new TenantTypeOrmEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.slug = domain.slug;
    entity.description = domain.description;
    entity.logoUrl = domain.logoUrl;
    entity.isActive = domain.isActive !== undefined ? domain.isActive : true;
    return entity;
  }
}
