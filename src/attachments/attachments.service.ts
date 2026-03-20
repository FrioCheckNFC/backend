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
    const attachment = this.attachmentRepository.create(createAttachmentDto);
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

  async findByVisit(visitId: string): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { visit: { id: visitId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByWorkOrder(workOrderId: string): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { workOrder: { id: workOrderId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTicket(ticketId: string): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { ticket: { id: ticketId } },
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
