import { AuthUserReaderPort } from '../ports/auth-user-reader.port';
import { PasswordHasherPort } from '../ports/password-hasher.port';
import { TokenSignerPort } from '../ports/token-signer.port';

export class InvalidCredentialsError extends Error {}
export class InactiveUserError extends Error {}
export class TenantNotFoundError extends Error {}

export interface LoginOutput {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string | string[];
    roles?: string[]; // Compatibilidad app movil
    tenantId: string;
    rut?: string;
    phone?: string;
  };
}

import { TenantsService } from '../../../modules/tenants/tenants.service';
import { NotFoundException } from '@nestjs/common';

export class LoginUseCase {
  constructor(
    private readonly userReader: AuthUserReaderPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenSigner: TokenSignerPort,
    private readonly tenantsService: TenantsService,
  ) {}

  async execute(identifier: string, password: string): Promise<LoginOutput> {
    const user = await this.userReader.findByEmail(identifier);
    if (!user) {
      throw new InvalidCredentialsError('Email, RUT o contrasena incorrectos');
    }

    if (!user.active) {
      throw new InactiveUserError('Usuario desactivado');
    }

    try {
      const tenant = await this.tenantsService.findOne(user.tenantId);
      if (!tenant.isActive) {
        throw new InactiveUserError('El tenant está deshabilitado');
      }
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new TenantNotFoundError('Error de configuracion del usuario');
      }
      throw err;
    }

    const passwordValid = await this.passwordHasher.compare(
      password,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new InvalidCredentialsError('Email, RUT o contrasena incorrectos');
    }

    const userRolesResult = await this.userReader.getUserRoles(user.id);
    const role =
      userRolesResult && userRolesResult.length > 0
        ? userRolesResult
        : user.role || ['TECHNICIAN'];

    const accessToken = this.tokenSigner.sign({
      sub: user.id,
      email: user.email,
      role: role[0] || 'TECHNICIAN', // app legacy
      roles: role,                   // nueva app
      tenantId: user.tenantId,
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: role[0] || 'TECHNICIAN',
        roles: role,
        tenantId: user.tenantId,
        rut: user.rut || undefined,
        phone: user.phone || undefined,
      },
    };
  }
}
