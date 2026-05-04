import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';

@Injectable()
export class RemoveUserUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly usersRepo: UserRepositoryPort,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const user = await this.usersRepo.findById(id, tenantId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.usersRepo.remove(user);
  }
}
