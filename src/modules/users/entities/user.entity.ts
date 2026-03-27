// Entidad User: representa la tabla "users" en PostgreSQL (Azure).
// Debe coincidir exactamente con las columnas de la tabla existente.
// Si se agrega o quita un @Column, hay que hacer una migracion en la BD.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('users') // Nombre de la tabla en la BD
export class User {
  // Clave primaria UUID generada automaticamente por PostgreSQL
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant. Cada usuario pertenece a un tenant (multi-tenant)
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // Email unico, se usa para login
  @Column({ unique: true })
  email: string;

  // Hash bcrypt de la contrasena. Nunca se guarda en texto plano.
  @Column({ name: 'password_hash' })
  passwordHash: string;

  // Nombre del usuario
  @Column({ name: 'first_name' })
  firstName: string;

  // Apellido del usuario
  @Column({ name: 'last_name' })
  lastName: string;

  // Telefono (opcional)
  @Column({ nullable: true })
  phone: string;

  // Rol del usuario: ADMIN, SUPPORT, VENDOR, RETAILER, TECHNICIAN, DRIVER
  @Column()
  role: string;

  // Tokens FCM para notificaciones push (opcional)
  @Column({ name: 'fcm_tokens', type: 'text', nullable: true })
  fcmTokens: string;

  // Si es false, el usuario no puede hacer login
  @Column({ default: true })
  active: boolean;

  // Timestamps automaticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete: no se borra de la BD, solo se marca con fecha
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
