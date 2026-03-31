// create-media.dto.ts
// Datos para registrar un archivo subido.
// El archivo se sube aparte (multipart/form-data).
// Este DTO registra los metadatos en la BD.

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty({
    example: 'visit',
    description: 'Tipo de entidad: visit, ticket, asset',
  })
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID de la entidad asociada',
  })
  @IsNotEmpty()
  @IsUUID()
  entityId: string;

  @ApiProperty({
    example: 'https://storage.blob.core.windows.net/photos/foto1.jpg',
    description: 'URL del archivo',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    example: 'foto-camara-3.jpg',
    description: 'Nombre original del archivo',
  })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'image/jpeg', description: 'Tipo MIME' })
  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @ApiProperty({
    example: 245000,
    description: 'Tamano en bytes',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  fileSize?: number;
}
