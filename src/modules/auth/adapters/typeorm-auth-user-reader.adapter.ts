import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUserReaderPort, AuthUserRecord } from '../../../application/auth/ports/auth-user-reader.port';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class TypeormAuthUserReaderAdapter implements AuthUserReaderPort {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const user = await this.usersRepo.findOne({ where: { email } });
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
      tenantId: user.tenantId,
      active: user.active,
    };
  }
}
