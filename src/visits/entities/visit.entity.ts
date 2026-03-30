import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Machine } from '../../machines/entities/machine.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';

export enum VisitStatus {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
  ANULADA = 'ANULADA',
}

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Foreign Key Columns (para poder setearlos directamente)
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @Column({ name: 'machine_id', type: 'uuid' })
  machine_id: string;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column({ name: 'check_in_timestamp' })
  checkInTimestamp: Date;

  @Column({ name: 'check_out_timestamp', nullable: true })
  checkOutTimestamp: Date;

  // NFC validation
  @Column({ name: 'check_in_nfc_uid', length: 14 })
  checkInNfcUid: string;

  @Column({ name: 'check_out_nfc_uid', length: 14, nullable: true })
  checkOutNfcUid: string;

  // GPS validation (±10m accuracy)
  @Column({
    name: 'check_in_gps_lat',
    type: 'decimal',
    precision: 10,
    scale: 8,
  })
  checkInGpsLat: number;

  @Column({
    name: 'check_in_gps_lng',
    type: 'decimal',
    precision: 11,
    scale: 8,
  })
  checkInGpsLng: number;

  @Column({
    name: 'check_out_gps_lat',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  checkOutGpsLat: number;

  @Column({
    name: 'check_out_gps_lng',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  checkOutGpsLng: number;

  // Validation status
  @Column({
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.ABIERTA,
  })
  status: VisitStatus;

  @Column({ name: 'is_valid', default: true })
  isValid: boolean;

  @Column({ name: 'validation_notes', type: 'text', nullable: true })
  validationNotes: string;
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => Attachment, (attachment) => attachment.visit)
  attachments: Attachment[];
}
