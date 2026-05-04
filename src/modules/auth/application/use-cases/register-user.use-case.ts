import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { AuthUserRepositoryPort } from '../../domain/ports/auth-user-repository.port';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { AUTH_USER_REPOSITORY, PASSWORD_HASHER } from '../../infrastructure/tokens';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly usersRepo: AuthUserRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    rut?: string;
    role?: string[];
  }) {
    const allowedRoles = ['TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER'];
    const requestedRoles = data.role || ['TECHNICIAN'];
    
    const filteredRoles = requestedRoles.filter(r => allowedRoles.includes(r.toUpperCase()));
    const finalRoles = filteredRoles.length > 0 ? filteredRoles : ['TECHNICIAN'];

    const exists = await this.usersRepo.findByEmail(data.email);
    if (exists) {
      throw new UnauthorizedException('Ya existe un usuario con ese email');
    }

    const hash = await this.passwordHasher.hash(data.password);

    try {
      const saved = await this.usersRepo.create({
        email: data.email,
        rut: data.rut ?? undefined,
        passwordHash: hash,
        firstName: data.firstName,
        lastName: data.lastName,
        tenantId: data.tenantId,
        role: finalRoles,
      });

      return {
        id: saved.id,
        email: saved.email,
        firstName: saved.firstName,
        lastName: saved.lastName,
        role: saved.role,
      };
    } catch (err: any) {
      if (err.code === '23503') {
        throw new BadRequestException('El tenantId proporcionado no existe en la tabla tenants');
      }
      throw err;
    }
  }
}
