import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly usersRepo: UserRepositoryPort,
  ) {}

  async execute(id: string, currentPassword: string, newPassword: string, tenantId: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findById(id, tenantId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.save(user);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
