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

export enum TicketType {
  FALLA = 'falla',
  MERMA = 'merma',
  ERROR_NFC = 'error_nfc',
  MANTENIMIENTO = 'mantenimiento',
  OTRO = 'otro',
}

export enum TicketStatus {
  ABIERTO = 'abierto',
  EN_PROGRESO = 'en_progreso',
  CERRADO = 'cerrado',
  RECHAZADO = 'rechazado',
}

export enum TicketPriority {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string;

  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machine_id: string;

  @Column({ name: 'reported_by_id', type: 'uuid' })
  reported_by_id: string;

  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assigned_to_id: string;

  @Column({ name: 'resolved_by_id', type: 'uuid', nullable: true })
  resolved_by_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Machine, { nullable: true })
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by_id' })
  reportedBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolved_by_id' })
  resolvedBy: User;

  @Column({
    type: 'enum',
    enum: TicketType,
  })
  type: TicketType;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.ABIERTO,
  })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIA,
  })
  priority: TicketPriority;

  @Column({ name: 'title', length: 200 })
  title: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  // NFC alternatives (cuando no se puede usar NFC)
  @Column({ name: 'can_use_manual_entry', default: true })
  canUseManualEntry: boolean;

  @Column({ name: 'manual_machine_id', length: 100, nullable: true })
  manualMachineId: string;

  @Column({ name: 'machine_photo_plate_url', length: 500, nullable: true })
  machinePhotoPlateUrl: string;

  // Resolution
  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  // SLA tracking
  @Column({ name: 'due_date', nullable: true })
  dueDate: Date;

  @Column({ name: 'time_spent_minutes', nullable: true })
  timeSpentMinutes: number;

  // Relationships
  @OneToMany(() => Attachment, (attachment) => attachment.ticket)
  attachments: Attachment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
