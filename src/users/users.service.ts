import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async create(createUserDto: CreateUserDto, tenantId?: string): Promise<User> {
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
      user.password_hash = await this.hashPassword(updateUserDto.password);
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
