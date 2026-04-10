import { Attachment } from '../entities/attachment.entity';

export interface AttachmentRepositoryPort {
  findAll(tenantId: string): Promise<Attachment[]>;
  findById(id: string, tenantId?: string): Promise<Attachment | null>;
  findByEntity(entityId: string, entityType: string, tenantId: string): Promise<Attachment[]>;
  create(attachment: Partial<Attachment>): Promise<Attachment>;
  save(attachment: Attachment): Promise<Attachment>;
  softRemove(attachment: Attachment): Promise<void>;
}
