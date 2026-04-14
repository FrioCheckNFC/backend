// AuthService: contiene la logica de negocio de autenticacion.
// No sabe nada de HTTP ni de endpoints. Solo recibe datos, los procesa y devuelve resultados.
// El controller es quien recibe el HTTP request y le pasa los datos aca.

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import {
  InactiveUserError,
  InvalidCredentialsError,
  TenantNotFoundError,
  LoginUseCase,
} from '../use-cases/login.use-case';
import { ForgotPasswordUseCase } from '../use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import { LOGIN_USE_CASE } from '../tokens';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

    @Inject(LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  async login(identifier: string, password: string) {
    try {
      return await this.loginUseCase.execute(identifier, password);
    } catch (err) {
      if (
        err instanceof InvalidCredentialsError ||
        err instanceof InactiveUserError ||
        err instanceof TenantNotFoundError
      ) {
        throw new UnauthorizedException(err.message);
      }
      throw err;
    }
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    rut?: string;
    role?: string[];
  }) {
    // Seguridad: Filtrar roles prohibidos en registro público (ADMIN, SUPPORT)
    const allowedRoles = ['TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER'];
    const requestedRoles = data.role || ['TECHNICIAN'];
    
    // Solo dejamos los roles que estén en la lista de permitidos
    const filteredRoles = requestedRoles.filter(r => allowedRoles.includes(r.toUpperCase()));
    
    // Si no queda ningún rol válido después del filtro, asignamos TECHNICIAN por defecto
    const finalRoles = filteredRoles.length > 0 ? filteredRoles : ['TECHNICIAN'];

    const exists = await this.usersRepo.findOne({
      where: { email: data.email },
    });
    if (exists) {
      throw new UnauthorizedException('Ya existe un usuario con ese email');
    }

    const hash = await bcrypt.hash(data.password, 10);

    const user = this.usersRepo.create({
      email: data.email,
      rut: data.rut ?? undefined,
      passwordHash: hash,
      firstName: data.firstName,
      lastName: data.lastName,
      tenantId: data.tenantId,
      role: finalRoles,
    });

    try {
      const saved = await this.usersRepo.save(user);

      return {
        id: saved.id,
        email: saved.email,
        firstName: saved.firstName,
        lastName: saved.lastName,
        role: saved.role,
      };
    } catch (err: any) {
      if (err.code === '23503') {
        throw new BadRequestException(
          'El tenantId proporcionado no existe en la tabla tenants',
        );
      }
      throw err;
    }
  }

  async forgotPassword(email: string) {
    return this.forgotPasswordUseCase.execute(email);
  }

  async resetPassword(token: string, newPassword: string) {
    return this.resetPasswordUseCase.execute(token, newPassword);
  }

  async checkUser(identifier: string) {
    const user = await this.usersRepo.findOne({
      where: [{ email: identifier }, { rut: identifier }],
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return {
      exists: true,
      active: user.active,
      email: user.email,
    };
  }

  async createSuperAdmin(data: { email: string; password: string; firstName: string; lastName: string }) {
    const existingSuperAdmin = await this.usersRepo.findOne({
      where: { role: 'SUPER_ADMIN' } as any,
    });

    if (existingSuperAdmin) {
      throw new BadRequestException('Ya existe un SUPER_ADMIN');
    }

    const hash = await bcrypt.hash(data.password, 10);

    const user = this.usersRepo.create({
      email: data.email,
      passwordHash: hash,
      firstName: data.firstName,
      lastName: data.lastName,
      tenantId: null as any,
      role: ['SUPER_ADMIN'],
      active: true,
    });

    const saved = await this.usersRepo.save(user);

    return {
      id: saved.id,
      email: saved.email,
      firstName: saved.firstName,
      lastName: saved.lastName,
      role: saved.role,
    };
  }
}
