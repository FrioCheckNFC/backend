import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRoleEntity } from '../users/entities/user-role.entity';

@Injectable()
export class AuthService {
  private static readonly BCRYPT_ROUNDS = 10;
  private static readonly BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private validateRawCredentialInput(identifier: string, password: string): void {
    // Enforce exact credential matching by rejecting accidental surrounding spaces.
    if (identifier !== identifier.trim()) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (password !== password.trim()) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  private isBcryptHash(value: string): boolean {
    return AuthService.BCRYPT_HASH_REGEX.test(value);
  }

  async validateUser(identifier: string, password: string): Promise<any> {
    this.validateRawCredentialInput(identifier, password);

    const user = await this.usersRepository.findOne({
      where: [{ email: identifier }, { rut: identifier }],
      relations: ['tenant', 'userRoles'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!this.isBcryptHash(user.password_hash)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // No retornar password_hash
    const { password_hash, ...result } = user;
    return result;
  }

  async login(user: any) {
    // Obtener roles del usuario desde userRoles o fallback al campo role
    let roles: string[] = [];
    if (user.userRoles && user.userRoles.length > 0) {
      roles = user.userRoles.map((ur: any) => ur.role);
    } else if (user.role) {
      roles = [user.role];
    }
    
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role, // Mantener para compatibilidad
      roles: roles,    // Nuevo: array de roles
      tenantId: user.tenant_id,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '24h',
      }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,    // Mantener para compatibilidad
        roles: roles,       // Nuevo: array de roles
        tenantId: user.tenant_id,
      },
    };
  }

  async register(email: string, password: string, firstName: string, lastName: string, tenantId: string, role: string = 'TECNICO') {
    this.validateRawCredentialInput(email, password);

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, AuthService.BCRYPT_ROUNDS);

    if (!this.isBcryptHash(hashedPassword)) {
      throw new UnauthorizedException('No se pudo registrar el usuario');
    }

    const newUser = this.usersRepository.create({
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      tenant_id: tenantId,
      role: role as any,
      active: true,
    });

    await this.usersRepository.save(newUser);
    const { password_hash, ...result } = newUser;
    return result;
  }
}
