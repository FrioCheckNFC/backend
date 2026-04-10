import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Attachment } from '../entities/attachment.entity';
import { CreateAttachmentDto } from '../dto/attachment.dto';
import { AttachmentRepositoryPort } from '../repositories/attachment.repository.port';

@Injectable()
export class AttachmentsService {
  constructor(
    @Inject('ATTACHMENT_REPOSITORY')
    private readonly attachmentRepository: AttachmentRepositoryPort,
  ) {}

  async create(dto: CreateAttachmentDto, tenantId: string): Promise<Attachment> {
    const fileSizeValue = dto.fileSize || 0;
    const attachment = await this.attachmentRepository.create({
      ...dto,
      tenantId,
      fileSize: fileSizeValue,
    });
    return this.attachmentRepository.save(attachment);
  }

  async findAll(tenantId: string): Promise<Attachment[]> {
    return this.attachmentRepository.findAll(tenantId);
  }

  async findById(id: string, tenantId?: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findById(id, tenantId);
    if (!attachment) {
      throw new NotFoundException(`Adjunto con ID ${id} no encontrado`);
    }
    return attachment;
  }

  async findByWorkOrder(workOrderId: string, tenantId: string): Promise<Attachment[]> {
    return this.attachmentRepository.findByEntity(workOrderId, 'work_order', tenantId);
  }

  async findByVisit(visitId: string, tenantId: string): Promise<Attachment[]> {
    return this.attachmentRepository.findByEntity(visitId, 'visit', tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const attachment = await this.findById(id, tenantId);
    await this.attachmentRepository.softRemove(attachment);
  }
}
