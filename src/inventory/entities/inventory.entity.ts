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

export enum InventoryStatus {
  DISPONIBLE = 'disponible',
  EN_USO = 'en_uso',
  AGOTADO = 'agotado',
  EN_PEDIDO = 'en_pedido',
}

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'part_name', length: 200 })
  partName: string;

  @Column({ name: 'part_number', length: 100, nullable: true })
  partNumber: string;

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ name: 'min_quantity', type: 'integer', default: 0 })
  minQuantity: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  unitCost: number;

  @Column({
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.DISPONIBLE,
  })
  status: InventoryStatus;

  @Column({ name: 'location', length: 200, nullable: true })
  location: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
