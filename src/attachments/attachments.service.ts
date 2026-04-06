import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import { CreateAttachmentDto } from './dto/attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  async create(createAttachmentDto: CreateAttachmentDto): Promise<Attachment> {
    const attachment = this.attachmentRepository.create({
      tenant_id: createAttachmentDto.tenantId,
      uploaded_by_id: createAttachmentDto.uploadedById,
      visit_id: createAttachmentDto.visitId,
      work_order_id: createAttachmentDto.workOrderId,
      ticket_id: createAttachmentDto.ticketId,
      type: createAttachmentDto.type,
      category: createAttachmentDto.category,
      fileName: createAttachmentDto.fileName,
      fileSizeBytes: createAttachmentDto.fileSizeBytes,
      mimeType: createAttachmentDto.mimeType,
      azureBlobUrl: createAttachmentDto.azureBlobUrl,
      description: createAttachmentDto.description,
    });
    return this.attachmentRepository.save(attachment);
  }

  async findById(id: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'visit', 'workOrder', 'ticket', 'tenant'],
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  async findByVisit(visitId: string, tenantId?: string): Promise<Attachment[]> {
    const where: any = { visit: { id: visitId } };
    if (tenantId) {
      where.tenant = { id: tenantId };
    }
    return this.attachmentRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findByWorkOrder(workOrderId: string, tenantId?: string): Promise<Attachment[]> {
    const where: any = { workOrder: { id: workOrderId } };
    if (tenantId) {
      where.tenant = { id: tenantId };
    }
    return this.attachmentRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findByTicket(ticketId: string, tenantId?: string): Promise<Attachment[]> {
    const where: any = { ticket: { id: ticketId } };
    if (tenantId) {
      where.tenant = { id: tenantId };
    }
    return this.attachmentRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    const attachment = await this.findById(id);
    // En producción, también borraría de Azure Blob Storage
    await this.attachmentRepository.remove(attachment);
  }

  // Validar tipos de archivo aceptados
  isValidMimeType(mimeType: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/quicktime',
    ];
    return allowedTypes.includes(mimeType);
  }
}
