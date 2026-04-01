import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private static readonly BCRYPT_ROUNDS = 10;
  private static readonly BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  private validateRawCredentialInput(email: string, password: string): void {
    if (email !== email.trim()) {
      throw new BadRequestException('El email no debe tener espacios al inicio o final');
    }

    if (password !== password.trim()) {
      throw new BadRequestException('La contraseña no debe tener espacios al inicio o final');
    }
  }

  private isBcryptHash(value: string): boolean {
    return UsersService.BCRYPT_HASH_REGEX.test(value);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, UsersService.BCRYPT_ROUNDS);
  }

  async create(createUserDto: CreateUserDto, tenantId?: string): Promise<User> {
    this.validateRawCredentialInput(createUserDto.email, createUserDto.password);

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const finalTenantId = createUserDto.tenantId || tenantId;
    if (!finalTenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const user = new User();
    user.first_name = createUserDto.firstName || createUserDto.fullName || 'Usuario';
    user.last_name = createUserDto.lastName || '';
    user.email = createUserDto.email;
    user.phone = createUserDto.phone;
    user.role = createUserDto.role;
    user.password_hash = await this.hashPassword(createUserDto.password);

    if (!this.isBcryptHash(user.password_hash)) {
      throw new BadRequestException('No se pudo generar un hash válido para la contraseña');
    }

    user.active = true;
    user.tenant_id = finalTenantId;

    return this.userRepository.save(user);
  }

  async findAll(tenantId?: string): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.tenant', 'tenant');
    if (tenantId) {
      query.where('user.tenant_id = :tenantId', { tenantId });
    }
    return query.getMany();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['tenant'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (updateUserDto.password) {
      this.validateRawCredentialInput(user.email, updateUserDto.password);
      user.password_hash = await this.hashPassword(updateUserDto.password);

      if (!this.isBcryptHash(user.password_hash)) {
        throw new BadRequestException('No se pudo generar un hash válido para la contraseña');
      }
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.softRemove(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  // ==========================================
  // GESTIÓN DE ROLES
  // ==========================================

  async getUserRoles(userId: string): Promise<string[]> {
    const user = await this.findById(userId);
    return user.roles;
  }

  async addRole(userId: string, role: string): Promise<UserRoleEntity> {
    // Validar que el rol sea válido
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new BadRequestException(`Rol inválido: ${role}. Roles válidos: ${Object.values(UserRole).join(', ')}`);
    }

    // Verificar que el usuario existe
    const user = await this.findById(userId);

    // Verificar si ya tiene ese rol
    const existingRole = await this.userRoleRepository.findOne({
      where: { user_id: userId, role },
    });

    if (existingRole) {
      throw new BadRequestException(`El usuario ya tiene el rol ${role}`);
    }

    // Crear el nuevo rol
    const userRole = new UserRoleEntity();
    userRole.user_id = userId;
    userRole.role = role;

    return this.userRoleRepository.save(userRole);
  }

  async removeRole(userId: string, role: string): Promise<void> {
    // Verificar que el usuario existe
    await this.findById(userId);

    const userRole = await this.userRoleRepository.findOne({
      where: { user_id: userId, role },
    });

    if (!userRole) {
      throw new NotFoundException(`El usuario no tiene el rol ${role}`);
    }

    // Verificar que no sea el último rol
    const rolesCount = await this.userRoleRepository.count({
      where: { user_id: userId },
    });

    if (rolesCount <= 1) {
      throw new BadRequestException('No se puede eliminar el último rol del usuario');
    }

    await this.userRoleRepository.remove(userRole);
  }

  async setRoles(userId: string, roles: string[]): Promise<UserRoleEntity[]> {
    // Validar roles
    for (const role of roles) {
      if (!Object.values(UserRole).includes(role as UserRole)) {
        throw new BadRequestException(`Rol inválido: ${role}`);
      }
    }

    if (roles.length === 0) {
      throw new BadRequestException('Debe asignar al menos un rol');
    }

    // Verificar que el usuario existe
    await this.findById(userId);

    // Eliminar roles existentes
    await this.userRoleRepository.delete({ user_id: userId });

    // Crear nuevos roles
    const userRoles = roles.map((role) => {
      const userRole = new UserRoleEntity();
      userRole.user_id = userId;
      userRole.role = role;
      return userRole;
    });

    return this.userRoleRepository.save(userRoles);
  }
}
