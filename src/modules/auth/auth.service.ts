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
import { User } from '../users/entities/user.entity';
import {
  InactiveUserError,
  InvalidCredentialsError,
  TenantNotFoundError,
  LoginUseCase,
} from '../../application/auth/use-cases/login.use-case';
import { ForgotPasswordUseCase } from '../../application/auth/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/auth/use-cases/reset-password.use-case';
import { LOGIN_USE_CASE } from './tokens';

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
    // FIX #2: roles NO se acepta en el registro público. Siempre se asigna TECHNICIAN.
    // Para crear ADMINs usar POST /api/v1/users (requiere JWT + rol ADMIN)
  }) {
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
<<<<<<< Updated upstream
      role: ['TECHNICIAN'],
=======
      role: ['TECHNICIAN'], // FIX #2: siempre TECHNICIAN en registro público
>>>>>>> Stashed changes
    });

    try {
      const saved = await this.usersRepo.save(user);

      return {
        id: saved.id,
        email: saved.email,
        firstName: saved.firstName,
        lastName: saved.lastName,
<<<<<<< Updated upstream
        role: saved.role[0],
        roles: saved.role,
=======
        role: saved.role,
        roles: saved.role, // Compatibilidad App
>>>>>>> Stashed changes
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
}
