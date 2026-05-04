import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { UserModel } from '../../domain/models/user.model';

@Injectable()
export class ManageRolesUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly usersRepo: UserRepositoryPort,
  ) {}

  async addRole(id: string, role: string, tenantId: string): Promise<UserModel> {
    const user = await this.usersRepo.findById(id, tenantId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const validRoles = [
      'ADMIN',
      'SUPPORT',
      'VENDOR',
      'RETAILER',
      'TECHNICIAN',
      'DRIVER',
    ];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Rol inválido');
    }

    if (!user.role.includes(role)) {
      user.role = [...user.role, role];
      await this.usersRepo.save(user);
    }

    return user;
  }

  async removeRole(id: string, role: string, tenantId: string): Promise<UserModel> {
    const user = await this.usersRepo.findById(id, tenantId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role.length <= 1) {
      throw new BadRequestException('El usuario debe tener al menos un rol');
    }

    user.role = user.role.filter((r) => r !== role);
    await this.usersRepo.save(user);

    return user;
  }
}
