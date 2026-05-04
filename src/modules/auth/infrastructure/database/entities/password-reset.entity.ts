import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserTypeOrmEntity as User } from '../../../../users/infrastructure/database/entities/user.typeorm.entity';

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // FIX #4: prefijo del token en texto plano para filtrar rápido sin iterar toda la tabla
  // Los primeros 8 caracteres del token (no son secretos por sí solos, el hash protege el resto)
  @Index()
  @Column({ name: 'token_prefix', length: 8 })
  tokenPrefix: string;

  @Column({ name: 'reset_token_hash' })
  resetTokenHash: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
