import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../entities/attachment.entity';
import { AttachmentRepositoryPort } from './attachment.repository.port';

@Injectable()
export class TypeOrmAttachmentRepositoryAdapter implements AttachmentRepositoryPort {
  constructor(
    @InjectRepository(Attachment)
    private readonly repo: Repository<Attachment>,
  ) {}

  async findAll(tenantId: string): Promise<Attachment[]> {
    return this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<Attachment | null> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    return this.repo.findOne({ where });
  }

  async findByEntity(entityId: string, entityType: string, tenantId: string): Promise<Attachment[]> {
    return this.repo.find({
      where: { entityId, entityType, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(attachment: Partial<Attachment>): Promise<Attachment> {
    const newAttachment = this.repo.create(attachment);
    return this.repo.save(newAttachment);
  }

  async save(attachment: Attachment): Promise<Attachment> {
    return this.repo.save(attachment);
  }

  async softRemove(attachment: Attachment): Promise<void> {
    await this.repo.softRemove(attachment);
  }
}
