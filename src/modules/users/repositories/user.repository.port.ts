import { User } from '../entities/user.entity';

export interface UserRepositoryPort {
  findAll(tenantId: string): Promise<User[]>;
  findById(id: string, tenantId: string): Promise<User | null>;
  findByEmailOrRut(identifier: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  save(user: User): Promise<User>;
  remove(user: User): Promise<void>;
}
