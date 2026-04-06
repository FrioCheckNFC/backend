import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuthUserReaderPort,
  AuthUserRecord,
} from '../../../application/auth/ports/auth-user-reader.port';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class TypeormAuthUserReaderAdapter implements AuthUserReaderPort {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(emailOrRut: string): Promise<AuthUserRecord | null> {
    const user = await this.usersRepo.findOne({
      where: [{ email: emailOrRut }, { rut: emailOrRut }],
    });
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      rut: user.rut || undefined,
      phone: user.phone || undefined,
      tenantId: user.tenantId,
      active: user.active,
    };
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const result = await this.usersRepo.manager.query(
      `SELECT role FROM user_roles WHERE user_id = $1`,
      [userId],
    );
    return result.map((r: any) => r.role);
  }
}
