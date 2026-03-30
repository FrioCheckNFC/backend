// visit.entity.ts
// Tabla "visits": registro de cada visita de un tecnico a un equipo.
// El tecnico llega al sitio, escanea el tag NFC del equipo, y la app crea una visita.
// Incluye GPS para validar que realmente estuvo ahi, y puede tener fotos de evidencia.

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
import { Asset } from '../../assets/entities/asset.entity';

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Tenant al que pertenece esta visita
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Tecnico que hizo la visita
  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'technician_id' })
  technician: User;

  // Equipo que fue visitado
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  // Coordenadas GPS del tecnico al momento de la visita
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  // Tag NFC que escaneo (para comprobar que estuvo fisicamente ahi)
  @Column({ name: 'nfc_tag_id', length: 255, nullable: true })
  nfcTagId?: string;

  // Temperatura registrada (lectura del equipo)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature?: number;

  // Notas del tecnico (texto libre)
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Estado de la visita
  // pending = creada pero no completada
  // completed = tecnico termino la revision
  // flagged = algo raro (temperatura fuera de rango, etc.)
  @Column({ default: 'completed' })
  status: string;

  // Fecha/hora en que se hizo la visita (puede diferir de createdAt si fue offline)
  @Column({ name: 'visited_at', type: 'timestamptz' })
  visitedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
