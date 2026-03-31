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
import { Machine } from '../../machines/entities/machine.entity';

@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assignedToId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo?: User;

  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machineId?: string;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine?: Machine;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 'medium' })
  priority: string;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
