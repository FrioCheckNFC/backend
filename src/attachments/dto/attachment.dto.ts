import { IsString, IsUUID, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { AttachmentType, AttachmentCategory } from '../entities/attachment.entity';

export class CreateAttachmentDto {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  uploadedById: string;

  @IsOptional()
  @IsUUID()
  visitId?: string;

  @IsOptional()
  @IsUUID()
  workOrderId?: string;

  @IsOptional()
  @IsUUID()
  ticketId?: string;

  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsEnum(AttachmentCategory)
  category: AttachmentCategory;

  @IsString()
  fileName: string;

  @IsNumber()
  fileSizeBytes: number;

  @IsString()
  mimeType: string;

  @IsString()
  azureBlobUrl: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AttachmentResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsUUID()
  uploadedById: string;

  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsEnum(AttachmentCategory)
  category: AttachmentCategory;

  @IsString()
  fileName: string;

  @IsNumber()
  fileSizeBytes: number;

  @IsString()
  mimeType: string;

  @IsString()
  azureBlobUrl: string;

  @IsOptional()
  @IsString()
  description?: string;

  createdAt: Date;
}
