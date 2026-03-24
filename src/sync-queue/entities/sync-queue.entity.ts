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
import { User } from '../../users/entities/user.entity';

export enum SyncOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum SyncStatus {
  PENDIENTE = 'PENDIENTE',
  SINCRONIZADO = 'SINCRONIZADO',
  FALLIDO = 'FALLIDO',
  REVISION_MANUAL = 'REVISION_MANUAL',
}

@Entity('sync_queue')
export class SyncQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'operation_type',
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

  // Error tracking
  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string;

  // Sincronización
  @Column({ name: 'synced_at', nullable: true })
  syncedAt: Date;

  // Referencia a la entidad creada después de sincronizar
  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string;

  @Column({ name: 'entity_type', length: 50, nullable: true })
  entityType: string;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
