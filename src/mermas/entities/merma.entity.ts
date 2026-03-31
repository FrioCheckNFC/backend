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
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Machine } from '../../machines/entities/machine.entity';

@Entity('mermas')
export class Merma {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'reported_by_id', type: 'uuid' })
  reportedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by_id' })
  reportedBy: User;

  @Column({ name: 'ticket_id', type: 'uuid', nullable: true })
  ticketId: string;

  @ManyToOne(() => Ticket, { nullable: true })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machineId: string;

  @ManyToOne(() => Machine, { nullable: true })
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column({ name: 'product_name', length: 200 })
  productName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 12, scale: 2 })
  unitCost: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 12, scale: 2 })
  totalCost: number;

  @Column({ name: 'cause', type: 'text', nullable: true })
  cause: string;

  @Column({ name: 'merma_date' })
  mermaDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
