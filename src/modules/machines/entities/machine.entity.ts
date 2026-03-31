// machine.entity.ts
// Tabla "machines": equipos de refrigeración que pertenecen a un tenant.
// Ejemplo: una cámara frigorífica, un refrigerador industrial, etc.
// Cada máquina tiene un tag NFC físico para que el técnico lo escanee en terreno.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 255, nullable: true })
  brand?: string;

  @Column({ length: 255, nullable: true })
  model?: string;

  @Column({ name: 'serial_number', length: 255, nullable: true })
  serialNumber?: string;

  @Column({ name: 'nfc_tag_id', length: 255, nullable: true, unique: true })
  nfcTagId?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
