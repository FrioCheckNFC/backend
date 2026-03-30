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
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Machine } from '../../machines/entities/machine.entity';

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

  // SID (Serial ID): Identificador único de serie de la máquina para vinculación del activo físico
  @Column({ name: 'machine_serial_id', length: 255 })
  machineSerialId: string;

  // TID (Tenant ID): Identificador ofuscado del cliente para evitar trazabilidad directa
  @Column({ name: 'tenant_id_obfuscated', length: 255 })
  tenantIdObfuscated: string;

  // CHK (Checksum): Hash corto para verificar integridad de datos y detectar alteraciones
  @Column({ name: 'integrity_checksum', length: 255 })
  integrityChecksum: string;

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