// asset.entity.ts
// Tabla "assets": equipos de refrigeracion que pertenecen a un tenant.
// Ejemplo: una camara frigorifica, un refrigerador industrial, etc.
// Cada asset tiene un tag NFC fisico para que el tecnico lo escanee en terreno.

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

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // A que empresa pertenece este equipo
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Nombre del equipo (ej: "Camara Frio #3", "Refrigerador Bodega Sur")
  @Column({ length: 255 })
  name: string;

  // Tipo de equipo (ej: "camara", "refrigerador", "vitrina")
  @Column({ length: 100 })
  type: string;

  // Marca y modelo (opcional, para inventario)
  @Column({ length: 255, nullable: true })
  brand?: string;

  @Column({ length: 255, nullable: true })
  model?: string;

  // Numero de serie del equipo (opcional)
  @Column({ name: 'serial_number', length: 255, nullable: true })
  serialNumber?: string;

  // ID del tag NFC pegado al equipo (lo lee el celular del tecnico)
  @Column({ name: 'nfc_tag_id', length: 255, nullable: true, unique: true })
  nfcTagId?: string;

  // Ubicacion del equipo (texto libre: "Bodega 2, pasillo 3")
  @Column({ nullable: true })
  location?: string;

  // Coordenadas GPS de referencia (para validar que el tecnico esta ahi)
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  // Si el equipo esta activo o dado de baja
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
