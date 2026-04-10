import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRepositoryPort } from './user.repository.port';

@Injectable()
export class TypeOrmUserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findAll(tenantId: string): Promise<User[]> {
    return this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'email',
        'rut',
        'firstName',
        'lastName',
        'phone',
        'role',
        'active',
        'tenantId',
        'createdAt',
      ],
    });
  }

  async findById(id: string, tenantId: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      select: [
        'id',
        'email',
        'rut',
        'firstName',
        'lastName',
        'phone',
        'role',
        'active',
        'tenantId',
        'createdAt',
      ],
    });
  }

  async findByEmailOrRut(identifier: string): Promise<User | null> {
    return this.repo.findOne({
      where: [{ email: identifier }, { rut: identifier }],
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repo.create(user);
    return this.repo.save(newUser);
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  async remove(user: User): Promise<void> {
    await this.repo.softRemove(user);
  }
}
