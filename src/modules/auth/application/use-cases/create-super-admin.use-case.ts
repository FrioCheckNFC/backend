import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { AuthUserRepositoryPort } from '../../domain/ports/auth-user-repository.port';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { AUTH_USER_REPOSITORY, PASSWORD_HASHER } from '../../infrastructure/tokens';

@Injectable()
export class CreateSuperAdminUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly usersRepo: AuthUserRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(data: { email: string; password: string; firstName: string; lastName: string }) {
    const existing = await this.usersRepo.findSuperAdmin();

    if (existing) {
      throw new BadRequestException('Ya existe un SUPER_ADMIN');
    }

    const hash = await this.passwordHasher.hash(data.password);

    const saved = await this.usersRepo.create({
      email: data.email,
      passwordHash: hash,
      firstName: data.firstName,
      lastName: data.lastName,
      tenantId: null as any,
      role: ['SUPER_ADMIN'] as any,
      active: true,
    });

    return {
      id: saved.id,
      email: saved.email,
      firstName: saved.firstName,
      lastName: saved.lastName,
      role: saved.role,
    };
  }
}
