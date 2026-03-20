import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Machine } from '../../machines/entities/machine.entity';
import { Visit } from '../../visits/entities/visit.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';

export enum WorkOrderStatus {
  PENDIENTE = 'pendiente',
  EN_TRANSITO = 'en_transito',
  ENTREGADO = 'entregado',
  RECHAZADO = 'rechazado',
  CANCELADO = 'cancelado',
}

export enum WorkOrderType {
  ENTREGA = 'entrega',
  REPOSICION = 'reposicion',
  RETIRO = 'retiro',
  REPARACION = 'reparacion',
}

@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_user_id' })
  assignedUser: User;

  @ManyToOne(() => Visit, { nullable: true })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;

  @Column({
    type: 'enum',
    enum: WorkOrderType,
    default: WorkOrderType.ENTREGA,
  })
  type: WorkOrderType;

  @Column({
    type: 'enum',
    enum: WorkOrderStatus,
    default: WorkOrderStatus.PENDIENTE,
  })
  status: WorkOrderStatus;

  // NFC validation
  @Column({ name: 'expected_nfc_uid', length: 14 })
  expectedNfcUid: string;

  @Column({ name: 'actual_nfc_uid', length: 14, nullable: true })
  actualNfcUid: string;

  @Column({ name: 'nfc_validated', default: false })
  nfcValidated: boolean;

  // GPS validation
  @Column({
    name: 'expected_location_lat',
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  expectedLocationLat: number;

  @Column({
    name: 'expected_location_lng',
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  expectedLocationLng: number;

  @Column({
    name: 'actual_location_lat',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  actualLocationLat: number;

  @Column({
    name: 'actual_location_lng',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  actualLocationLng: number;

  // Dates
  @Column({ name: 'estimated_delivery_date' })
  estimatedDeliveryDate: Date;

  @Column({ name: 'delivery_date', nullable: true })
  deliveryDate: Date;

  // Details
  @Column({ name: 'description', length: 500, nullable: true })
  description: string;

  @Column({ name: 'rejection_reason', length: 500, nullable: true })
  rejectionReason: string;

  // Signature/Conformity
  @Column({ name: 'signed_by', length: 100, nullable: true })
  signedBy: string;

  @Column({ name: 'signature_url', length: 500, nullable: true })
  signatureUrl: string;

  // Relationships
  @OneToMany(() => Attachment, (attachment) => attachment.workOrder)
  attachments: Attachment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
