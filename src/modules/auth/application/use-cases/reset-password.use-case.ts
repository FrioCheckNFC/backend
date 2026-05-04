import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from '../../../auth/infrastructure/database/entities/password-reset.entity';
import { UserTypeOrmEntity as User } from '../../../users/infrastructure/database/entities/user.typeorm.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async execute(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // FIX #4: filtrar primero por tokenPrefix (O(1) vs O(n×bcrypt) previo)
    // Solo comparamos bcrypt contra los registros con el mismo prefijo (típicamente 1)
    const tokenPrefix = token.substring(0, 8);

    const candidates = await this.passwordResetRepo.find({
      where: { tokenPrefix, used: false },
    });

    if (candidates.length === 0) {
      throw new BadRequestException('Token de recuperacion invalido');
    }

    // Verificar el hash contra el (o los) candidatos con ese prefijo
    let validReset: PasswordReset | null = null;
    for (const reset of candidates) {
      const isValid = await bcrypt.compare(token, reset.resetTokenHash);
      if (isValid) {
        validReset = reset;
        break;
      }
    }

    if (!validReset) {
      throw new BadRequestException('Token de recuperacion invalido');
    }

    if (validReset.expiresAt < new Date()) {
      throw new BadRequestException('El token ha expirado. Solicita uno nuevo.');
    }

    const user = await this.usersRepo.findOne({
      where: { id: validReset.userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.save(user);

    // Marcar token como usado (no se puede reutilizar)
    validReset.used = true;
    await this.passwordResetRepo.save(validReset);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
