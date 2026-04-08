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

  @Column({ name: 'assigned_user_id', type: 'uuid', nullable: true })
  assignedUserId?: string;

  @Column({ name: 'location_name', length: 255, nullable: true })
  name: string;

  @Column({ length: 255, nullable: true })
  brand?: string;

  @Column({ length: 255, nullable: true })
  model?: string;

  @Column({ name: 'serial_number', length: 255, nullable: true })
  serialNumber?: string;

  @Column({ length: 50, default: 'OPERATIVE' })
  status?: string;

  // Se mantienen estas columnas porque SÍ existen en la DB real:
  @Column({ name: 'nfc_tag_id', length: 255, nullable: true, unique: true })
  nfcTagId?: string;

  @Column({ name: 'nfc_code', length: 255, nullable: true })
  nfcCode?: string;

  @Column({ name: 'location_lat', type: 'float', nullable: true })
  latitude?: number;

  @Column({ name: 'location_lng', type: 'float', nullable: true })
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
