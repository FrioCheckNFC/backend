// users.service.ts
// Logica de negocio para CRUD de usuarios.
// Filtra por tenantId para respetar el aislamiento multi-tenant:
// un ADMIN solo ve los usuarios de su propia empresa.

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findAll(tenantId: string): Promise<User[]> {
    return this.usersRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'email',
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

  async findOne(id: string, tenantId: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id, tenantId },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'role',
        'active',
        'tenantId',
        'createdAt',
      ],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async create(dto: CreateUserDto, tenantId: string): Promise<User> {
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      email: dto.email,
      passwordHash: hash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: dto.role ?? ['TECHNICIAN'],
      tenantId,
    });

    const saved = await this.usersRepo.save(user);
    return this.findOne(saved.id, tenantId);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    tenantId: string,
  ): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id, tenantId } });
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

    await this.usersRepo.save(user);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { id, tenantId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.usersRepo.softRemove(user);
  }

  async findByEmail(emailOrRut: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: [{ email: emailOrRut }, { rut: emailOrRut }],
    });
  }

  async deactivate(id: string, tenantId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.active = false;
    return this.usersRepo.save(user);
  }

  async activate(id: string, tenantId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.active = true;
    return this.usersRepo.save(user);
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
    tenantId: string,
  ): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.save(user);

    return { message: 'Contraseña actualizada correctamente' };
  }

  async addRole(id: string, role: string, tenantId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id, tenantId } });
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

    return this.findOne(id, tenantId);
  }

  async removeRole(id: string, role: string, tenantId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role.length <= 1) {
      throw new BadRequestException('El usuario debe tener al menos un rol');
    }

    user.role = user.role.filter((r) => r !== role);
    await this.usersRepo.save(user);

    return this.findOne(id, tenantId);
  }
}
