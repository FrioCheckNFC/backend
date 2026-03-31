import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { UserRoleEntity } from './user-role.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  VENDOR = 'VENDOR',
  RETAILER = 'RETAILER',
  TECHNICIAN = 'TECHNICIAN',
  DRIVER = 'DRIVER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 12, nullable: true, unique: true })
  rut?: string;

  @Column({ name: 'password_hash', length: 255 })
  password_hash: string;

  @Column({ name: 'first_name', length: 255 })
  first_name: string;

  @Column({ name: 'last_name', length: 255 })
  last_name: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'users_role_enum',
    nullable: true,
  })
  role: UserRole;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user, { eager: true })
  userRoles: UserRoleEntity[];

  // Helper para obtener array de roles
  get roles(): string[] {
    if (this.userRoles && this.userRoles.length > 0) {
      return this.userRoles.map((ur) => ur.role);
    }
    // Fallback al rol legacy si no hay userRoles
    return this.role ? [this.role] : [];
  }

  @Column({ name: 'fcm_tokens', type: 'text', nullable: true })
  fcm_tokens?: string;

  @Column({ name: 'active', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}