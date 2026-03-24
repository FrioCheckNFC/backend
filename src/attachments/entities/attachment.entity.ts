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
import { Visit } from '../../visits/entities/visit.entity';
import { WorkOrder } from '../../work-orders/entities/work-order.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum AttachmentType {
  FOTO = 'foto',
  DOCUMENTO = 'documento',
  FIRMA = 'firma',
  VIDEO = 'video',
}

export enum AttachmentCategory {
  EVIDENCIA = 'evidencia',
  ANTES_DESPUES = 'antes_despues',
  DAÑOS = 'daños',
  PLACA_MAQUINA = 'placa_maquina',
  CONFIRMACION = 'confirmacion',
}

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string;

  @Column({ name: 'uploaded_by_id', type: 'uuid' })
  uploaded_by_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  // Explicit FK columns for direct assignment
  @Column({ name: 'visit_id', type: 'uuid', nullable: true })
  visit_id: string;

  @Column({ name: 'work_order_id', type: 'uuid', nullable: true })
  work_order_id: string;

  @Column({ name: 'ticket_id', type: 'uuid', nullable: true })
  ticket_id: string;

  // Relationships to different entities (nullable - can attach to multiple types)
  @ManyToOne(() => Visit, (visit) => visit.attachments, { nullable: true })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;

  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.attachments, {
    nullable: true,
  })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  @ManyToOne(() => Ticket, (ticket) => ticket.attachments, { nullable: true })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  // File details
  @Column({
    type: 'enum',
    enum: AttachmentType,
    default: AttachmentType.FOTO,
  })
  type: AttachmentType;

  @Column({
    type: 'enum',
    enum: AttachmentCategory,
  })
  category: AttachmentCategory;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_size_bytes' })
  fileSizeBytes: number;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  // Azure Blob Storage URL
  @Column({ name: 'azure_blob_url', length: 500 })
  azureBlobUrl: string;

  // Metadata
  @Column({ name: 'description', length: 500, nullable: true })
  description: string;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
