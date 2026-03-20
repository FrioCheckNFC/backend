import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

export enum SyncOperationType {
  VISIT_CHECK_IN = 'visit_check_in',
  VISIT_CHECK_OUT = 'visit_check_out',
  WORK_ORDER_DELIVERY = 'work_order_delivery',
  TICKET_REPORT = 'ticket_report',
  TICKET_UPDATE = 'ticket_update',
  ATTACHMENT_UPLOAD = 'attachment_upload',
}

export enum SyncStatus {
  PENDIENTE = 'pendiente',
  SINCRONIZADO = 'sincronizado',
  FALLIDO = 'fallido',
  REVISION_MANUAL = 'revision_manual',
}

@Entity('sync_queue')
export class SyncQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: SyncOperationType,
  })
  operationType: SyncOperationType;

  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDIENTE,
  })
  status: SyncStatus;

  // JSON payload con los datos de la operación
  @Column({ name: 'payload', type: 'json' })
  payload: Record<string, any>;

  // Reintento automático
  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', default: 3 })
  maxRetries: number;

  // Error tracking
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'error_stack', type: 'text', nullable: true })
  errorStack: string;

  // Sincronización
  @Column({ name: 'synced_at', nullable: true })
  syncedAt: Date;

  // Referencia a la entidad creada después de sincronizar
  @Column({ name: 'entity_id', length: 100, nullable: true })
  entityId: string;

  @Column({ name: 'entity_type', length: 50, nullable: true })
  entityType: string;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'next_retry_at', nullable: true })
  nextRetryAt: Date;
}
