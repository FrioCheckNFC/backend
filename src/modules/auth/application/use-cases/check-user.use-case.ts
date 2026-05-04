import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { AuthUserRepositoryPort } from '../../domain/ports/auth-user-repository.port';
import { AUTH_USER_REPOSITORY } from '../../infrastructure/tokens';

@Injectable()
export class CheckUserUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly usersRepo: AuthUserRepositoryPort,
  ) {}

  async execute(identifier: string) {
    const user = await this.usersRepo.findByIdentifier(identifier);

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
