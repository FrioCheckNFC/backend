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

export enum KpiType {
  VISITAS = 'visitas',
  VENTAS = 'ventas',
  TICKETS = 'tickets',
  MERMAS = 'mermas',
}

@Entity('kpis')
export class Kpi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string;

  @ManyToOne(() => Sector, { nullable: true })
  @JoinColumn({ name: 'sector_id' })
  sector: Sector;

  @Column({
    type: 'enum',
    enum: KpiType,
  })
  type: KpiType;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'target_value', type: 'decimal', precision: 12, scale: 2 })
  targetValue: number;

  @Column({ name: 'current_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentValue: number;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
