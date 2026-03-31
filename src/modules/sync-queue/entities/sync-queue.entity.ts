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

@Entity('sync_queue')
export class SyncQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'operation', length: 20 })
  operation: string;

  @Column({ type: 'jsonb', nullable: true })
  payload?: object;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
