// attachments.service.ts
// Lógica de negocio para archivos/fotos de evidencia.

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepo: Repository<Attachment>,
  ) {}

  async findByEntity(
    entityType: string,
    entityId: string,
    tenantId: string,
  ): Promise<Attachment[]> {
    return this.attachmentsRepo.find({
      where: { entityType, entityId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Attachment> {
    const attachment = await this.attachmentsRepo.findOne({
      where: { id, tenantId },
    });
    if (!attachment) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return attachment;
  }

  async create(
    dto: CreateAttachmentDto,
    uploadedById: string,
    tenantId: string,
  ): Promise<Attachment> {
    const attachment = this.attachmentsRepo.create({
      ...dto,
      uploadedById,
      tenantId,
    });
    return this.attachmentsRepo.save(attachment);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const attachment = await this.findOne(id, tenantId);
    await this.attachmentsRepo.softRemove(attachment);
  }
}
