import { UserModel } from '../../../domain/models/user.model';
import { UserTypeOrmEntity } from '../entities/user.typeorm.entity';

export class UserMapper {
  static toDomain(entity: UserTypeOrmEntity): UserModel {
    const model = new UserModel();
    model.id = entity.id;
    model.tenantId = entity.tenantId;
    model.email = entity.email;
    model.rut = entity.rut;
    model.passwordHash = entity.passwordHash;
    model.firstName = entity.firstName;
    model.lastName = entity.lastName;
    model.phone = entity.phone;
    model.role = entity.role;
    model.fcmTokens = entity.fcmTokens;
    model.active = entity.active;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    model.deletedAt = entity.deletedAt;
    return model;
  }

  static toPersistence(domain: UserModel): UserTypeOrmEntity {
    const entity = new UserTypeOrmEntity();
    if (domain.id) entity.id = domain.id;
    entity.tenantId = domain.tenantId;
    entity.email = domain.email;
    entity.rut = domain.rut;
    entity.passwordHash = domain.passwordHash;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.phone = domain.phone || null as any;
    entity.role = domain.role;
    entity.fcmTokens = domain.fcmTokens || null as any;
    entity.active = domain.active !== undefined ? domain.active : true;
    return entity;
  }
}
