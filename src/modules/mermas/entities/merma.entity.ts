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
import { TenantTypeOrmEntity as Tenant } from '../../tenants/infrastructure/database/entities/tenant.typeorm.entity';
import { UserTypeOrmEntity as User } from '../../users/infrastructure/database/entities/user.typeorm.entity';
import { MachineTypeOrmEntity as Machine } from '../../machines/infrastructure/database/entities/machine.typeorm.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

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

  @ManyToOne(() => Ticket)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machineId: string;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column({ name: 'product_name', type: 'varchar' })
  productName: string;

  @Column({ type: 'numeric' })
  quantity: number;

  @Column({ name: 'unit_cost', type: 'numeric' })
  unitCost: number;

  @Column({ name: 'total_cost', type: 'numeric' })
  totalCost: number;

  @Column({ type: 'text', nullable: true })
  cause: string;

  @Column({ name: 'merma_date', type: 'timestamp' })
  mermaDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
