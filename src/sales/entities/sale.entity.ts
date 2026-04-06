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
import { Sector } from '../../sectors/entities/sector.entity';
import { Machine } from '../../machines/entities/machine.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'vendor_id' })
  vendor: User;

  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string;

  @ManyToOne(() => Sector, { nullable: true })
  @JoinColumn({ name: 'sector_id' })
  sector: Sector;

  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machineId: string;

  @ManyToOne(() => Machine, { nullable: true })
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({ name: 'sale_date' })
  saleDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
