import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { NfcTag } from '../../nfc-tags/entities/nfc-tag.entity';

export enum MachineStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EN_RETIRO = 'en_retiro',
  EN_TRANSITO = 'en_transito',
}

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_user_id' })
  assignedUser: User;

  @OneToOne(() => NfcTag, (nfcTag) => nfcTag.machine, { nullable: true })
  nfcTag: NfcTag;

  @Column({ length: 100 })
  model: string;

  @Column({ length: 100, nullable: true })
  brand: string;

  @Column({ name: 'serial_number', length: 100, unique: true })
  serialNumber: string;

  @Column({ name: 'location_name', length: 200 })
  locationName: string;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLat: number;

  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLng: number;

  @Column({
    type: 'enum',
    enum: MachineStatus,
    default: MachineStatus.ACTIVE,
  })
  status: MachineStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}