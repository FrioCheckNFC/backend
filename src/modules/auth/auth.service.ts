// AuthService: contiene la logica de negocio de autenticacion.
// No sabe nada de HTTP ni de endpoints. Solo recibe datos, los procesa y devuelve resultados.
// El controller es quien recibe el HTTP request y le pasa los datos aca.

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    // Inyecta el repositorio de la tabla users (permite hacer queries)
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    // Inyecta el servicio JWT (permite generar y verificar tokens)
    private jwtService: JwtService,
  ) {}

  // Metodo login: recibe email y password, devuelve un JWT si las credenciales son validas.
  // Flujo: buscar usuario por email -> comparar password con hash -> generar token
  async login(email: string, password: string) {
    // 1. Buscar usuario por email en la base de datos
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email no encontrado');
    }

    // 2. Verificar que el usuario este activo
    if (!user.active) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // 3. Comparar la contrasena en texto plano con el hash almacenado en la BD
    // bcrypt.compare hashea el input y lo compara con el hash guardado
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Contrasena incorrecta');
    }

    // 4. Generar el token JWT con los datos del usuario
    // Este token es lo que el frontend manda en cada request posterior
    // en el header: Authorization: Bearer <token>
    const token = this.jwtService.sign({
      sub: user.id,       // sub = subject (estandar JWT)
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
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
