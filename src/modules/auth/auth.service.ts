// AuthService: contiene la logica de negocio de autenticacion.
// No sabe nada de HTTP ni de endpoints. Solo recibe datos, los procesa y devuelve resultados.
// El controller es quien recibe el HTTP request y le pasa los datos aca.

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import {
  InactiveUserError,
  InvalidCredentialsError,
  LoginUseCase,
} from '../../application/auth/use-cases/login.use-case';
import { LOGIN_USE_CASE } from './tokens';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

    @Inject(LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async login(email: string, password: string) {
    try {
      return await this.loginUseCase.execute(email, password);
    } catch (err) {
      if (err instanceof InvalidCredentialsError || err instanceof InactiveUserError) {
        throw new UnauthorizedException(err.message);
      }
      throw err;
    }
  }

  // Metodo register: crea un usuario nuevo con la contrasena hasheada.
  // Se usa para tener al menos un usuario de prueba.
  async register(data: { email: string; password: string; firstName: string; lastName: string; tenantId: string }) {
    // Verificar que no exista un usuario con ese email
    const exists = await this.usersRepo.findOne({ where: { email: data.email } });
    if (exists) {
      throw new UnauthorizedException('Ya existe un usuario con ese email');
    }

    // Hashear la contrasena con bcrypt (10 rondas de salt)
    // Nunca se guarda la contrasena en texto plano
    const hash = await bcrypt.hash(data.password, 10);

    // Crear la entidad y guardarla en la BD
    const user = this.usersRepo.create({
      email: data.email,
      passwordHash: hash,
      firstName: data.firstName,
      lastName: data.lastName,
      tenantId: data.tenantId,
      role: 'TECHNICIAN',
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
      // Error 23503 = foreign key violation (tenant_id no existe)
      if (err.code === '23503') {
        throw new BadRequestException('El tenantId proporcionado no existe en la tabla tenants');
      }
      throw err;
    }
  }
}
