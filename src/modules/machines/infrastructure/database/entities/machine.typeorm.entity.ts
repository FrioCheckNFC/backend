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
import { Store } from '../../../../stores/entities/store.entity';

@Entity('machines')
export class MachineTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // Elimino las relaciones ManyToOne/OneToOne por ahora para simplificar el piloto DDD
  // En un entorno real se inyectan las entidades correspondientes o se manejan por FK puras.
  
  @Column({ name: 'assigned_user_id', type: 'uuid', nullable: true })
  assignedUserId?: string;

  @Column({ name: 'store_id', type: 'uuid', nullable: true })
  storeId?: string;

  @ManyToOne(() => Store, (store) => store.machines)
  @JoinColumn({ name: 'store_id' })
  store?: Store;

  @Column({ name: 'location_name', length: 255, nullable: true })
  name: string; 

  @Column({ name: 'location_lat', type: 'float', nullable: true })
  latitude?: number; 

  @Column({ name: 'location_lng', type: 'float', nullable: true })
  longitude?: number; 

  @Column({ length: 255, nullable: true })
  brand?: string;

  @Column({ length: 255, nullable: true })
  model?: string;

  @Column({ name: 'serial_number', length: 255, nullable: true })
  serialNumber?: string;

  @Column({ length: 50, default: 'ACTIVE', nullable: true })
  status?: string;

  @Column({ name: 'acquisition_type', length: 20, nullable: true })
  acquisitionType?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
