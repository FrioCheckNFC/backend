import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TenantTypeOrmEntity as Tenant } from '../../tenants/infrastructure/database/entities/tenant.typeorm.entity';
import { UserTypeOrmEntity as User } from '../../users/infrastructure/database/entities/user.typeorm.entity';
import { Sector } from '../../sectors/entities/sector.entity';
import { MachineTypeOrmEntity as Machine } from '../../machines/infrastructure/database/entities/machine.typeorm.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string;

  @ManyToOne(() => Sector)
  @JoinColumn({ name: 'sector_id' })
  sector: Sector;

  @Column({ name: 'retailer_id', type: 'uuid', nullable: true })
  retailerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'retailer_id' })
  retailer: User;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ name: 'retailer_phone', length: 20, nullable: true })
  retailerPhone: string;

  @Column({ name: 'retailer_email', length: 255, nullable: true })
  retailerEmail: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Machine, (machine) => machine.store)
  machines: Machine[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
