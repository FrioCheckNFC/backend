// media.entity.ts
// Tabla "media": fotos y archivos subidos como evidencia.
// Puede estar asociada a una visita (foto del equipo) o a un ticket (foto del problema).
// El archivo real se sube a Azure Blob Storage. Aqui solo guardamos la URL.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Tenant dueno del archivo
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Quien subio el archivo
  @Column({ name: 'uploaded_by_id', type: 'uuid' })
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  // A que se asocia este archivo (flexible: visita, ticket, asset)
  // entity_type = "visit", "ticket", "asset"
  // entity_id = UUID de esa entidad
  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  // URL donde esta el archivo (Azure Blob Storage o local en desarrollo)
  @Column()
  url: string;

  // Nombre original del archivo
  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  // Tipo MIME (image/jpeg, image/png, application/pdf)
  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  // Tamano en bytes
  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
