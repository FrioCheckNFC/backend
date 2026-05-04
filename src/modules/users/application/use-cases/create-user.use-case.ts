import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { UserModel } from '../../domain/models/user.model';
import { CreateUserDto } from '../../infrastructure/http/dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly usersRepo: UserRepositoryPort,
  ) {}

  async execute(dto: CreateUserDto, tenantId: string): Promise<UserModel> {
    const exists = await this.usersRepo.findByEmailOrRut(dto.email);
    if (exists) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    return this.usersRepo.create({
      email: dto.email,
      passwordHash: hash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      rut: dto.rut,
      role: dto.role ?? ['TECHNICIAN'],
      tenantId,
    });
  }
}
