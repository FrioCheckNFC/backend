import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  AuthUserRepositoryPort,
} from '../../domain/ports/auth-user-repository.port';
import { AuthUserRecord } from '../../domain/ports/auth-user-reader.port';
import { UserTypeOrmEntity as User } from '../../../users/infrastructure/database/entities/user.typeorm.entity';

@Injectable()
export class TypeormAuthUserRepositoryAdapter implements AuthUserRepositoryPort {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const user = await this.usersRepo.findOne({
      where: { email: ILike(email) },
    });
    if (!user) return null;
    return this.mapToRecord(user);
  }

  async findByIdentifier(identifier: string): Promise<AuthUserRecord | null> {
    const user = await this.usersRepo.findOne({
      where: [{ email: ILike(identifier) }, { rut: ILike(identifier) }],
    });
    if (!user) return null;
    return this.mapToRecord(user);
  }

  async findSuperAdmin(): Promise<AuthUserRecord | null> {
    const existing = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.role @> :role', { role: ['SUPER_ADMIN'] })
      .getOne();
    if (!existing) return null;
    return this.mapToRecord(existing);
  }

  async create(user: Partial<AuthUserRecord>): Promise<AuthUserRecord> {
    const toSave = this.usersRepo.create({
      email: user.email,
      rut: user.rut,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: user.tenantId,
      role: user.role,
      active: user.active ?? true,
    });
    const saved = await this.usersRepo.save(toSave);
    return this.mapToRecord(saved as any);
  }

  private mapToRecord(user: any): AuthUserRecord {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      rut: user.rut || undefined,
      phone: user.phone || undefined,
      tenantId: user.tenantId,
      active: user.active,
    };
  }
}
