import { UserModel } from '../models/user.model';

export interface UserRepositoryPort {
  findAll(tenantId: string): Promise<UserModel[]>;
  findById(id: string, tenantId: string): Promise<UserModel | null>;
  findByEmailOrRut(identifier: string): Promise<UserModel | null>;
  create(user: Partial<UserModel>): Promise<UserModel>;
  save(user: UserModel): Promise<UserModel>;
  remove(user: UserModel): Promise<void>;
}
