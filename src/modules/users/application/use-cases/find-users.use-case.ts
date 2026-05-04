import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { UserModel } from '../../domain/models/user.model';

@Injectable()
export class FindUsersUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly usersRepo: UserRepositoryPort,
  ) {}

  async findAll(tenantId: string): Promise<UserModel[]> {
    return this.usersRepo.findAll(tenantId);
  }

  async findOne(id: string, tenantId: string): Promise<UserModel> {
    const user = await this.usersRepo.findById(id, tenantId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.usersRepo.findByEmailOrRut(email);
  }
}
