import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private static readonly BCRYPT_ROUNDS = 10;
  private static readonly BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    const query = this.userRepository.createQueryBuilder('user');
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
}
