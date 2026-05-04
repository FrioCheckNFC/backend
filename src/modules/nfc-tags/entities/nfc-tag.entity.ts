import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { TenantTypeOrmEntity as Tenant } from '../../tenants/infrastructure/database/entities/tenant.typeorm.entity';
import { MachineTypeOrmEntity as Machine } from '../../machines/infrastructure/database/entities/machine.typeorm.entity';

@Entity('nfc_tags')
export class NfcTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string;

  @Column({ name: 'machine_id', type: 'uuid' })
  machine_id: string;

  @OneToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // UID físico del tag (14 bytes en hex) - Detecta clonaciones
  @Column({ length: 14, unique: true })
  uid: string;

  @Column({ name: 'tag_model', length: 20, default: 'NTAG-215' })
  tagModel: string;

  @Column({ name: 'hardware_model', length: 20, default: 'NTAG215' })
  hardwareModel: string;

  @Column({ name: 'is_locked', default: false })
  isLocked: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}