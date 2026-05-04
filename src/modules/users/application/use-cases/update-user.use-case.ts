import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { UserModel } from '../../domain/models/user.model';
import { UpdateUserDto } from '../../infrastructure/http/dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly usersRepo: UserRepositoryPort,
  ) {}

  async execute(id: string, dto: UpdateUserDto, tenantId: string): Promise<UserModel> {
    const user = await this.usersRepo.findById(id, tenantId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.email) user.email = dto.email;
    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.role) user.role = Array.isArray(dto.role) ? dto.role : [dto.role];
    if (dto.active !== undefined) user.active = dto.active;
    if (dto.rut) user.rut = dto.rut;

    const saved = await this.usersRepo.save(user);
    return saved; // Or force refetch via findById if strict consistency is needed
  }

  async setActivation(id: string, active: boolean, tenantId: string): Promise<UserModel> {
    const user = await this.usersRepo.findById(id, tenantId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.active = active;
    return this.usersRepo.save(user);
  }
}
