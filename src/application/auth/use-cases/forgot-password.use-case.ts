import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from '../../../modules/auth/entities/password-reset.entity';
import { User } from '../../../modules/users/entities/user.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { email } });

    // Siempre respondemos igual aunque el email no exista (evita user enumeration)
    if (!user) {
      return {
        message:
          'Si el email existe, recibirás un enlace para resetear tu contraseña',
      };
    }

    // Generar token seguro de 64 chars hexadecimales
    const token = crypto.randomBytes(32).toString('hex');

    // FIX #4: guardar los primeros 8 chars en texto para filtrar sin iterar toda la tabla
    const tokenPrefix = token.substring(0, 8);
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Invalidar tokens anteriores del mismo usuario
    await this.passwordResetRepo.delete({ userId: user.id });

    const reset = this.passwordResetRepo.create({
      userId: user.id,
      tokenPrefix,
      resetTokenHash: tokenHash,
      expiresAt,
    });
    await this.passwordResetRepo.save(reset);

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Log solo en desarrollo (no exponer URL en producción)
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`[Password Reset] URL: ${resetUrl}`);
    }

    // FIX: NO devolvemos el token en la respuesta HTTP (solo va por email)
    return {
      message:
        'Si el email existe, recibirás un enlace para resetear tu contraseña',
    };
  }
}
