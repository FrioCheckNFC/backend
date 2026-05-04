import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { UserRepositoryPort } from '../../../domain/repositories/user.repository.port';
import { UserModel } from '../../../domain/models/user.model';
import { UserTypeOrmEntity } from '../entities/user.typeorm.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class TypeormUserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private readonly repo: Repository<UserTypeOrmEntity>,
  ) {}

  async findAll(tenantId: string): Promise<UserModel[]> {
    const records = await this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return records.map(UserMapper.toDomain);
  }

  async findById(id: string, tenantId: string): Promise<UserModel | null> {
    const record = await this.repo.findOne({
      where: { id, tenantId },
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByEmailOrRut(identifier: string): Promise<UserModel | null> {
    const record = await this.repo.findOne({
      where: [{ email: ILike(identifier) }, { rut: ILike(identifier) }],
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async create(user: Partial<UserModel>): Promise<UserModel> {
    const toSave = this.repo.create(user as any);
    const saved = await this.repo.save(toSave);
    return UserMapper.toDomain(saved as any);
  }

  async save(user: UserModel): Promise<UserModel> {
    const entity = UserMapper.toPersistence(user);
    const saved = await this.repo.save(entity);
    return UserMapper.toDomain(saved as any);
  }

  async remove(user: UserModel): Promise<void> {
    const entity = UserMapper.toPersistence(user);
    await this.repo.softRemove(entity);
  }
}
