// media.service.ts
// Logica de negocio para archivos/fotos de evidencia.
// Por ahora registra los metadatos en la BD.
// La subida del archivo a Azure Blob se implementa despues (Fase 3).

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
  ) {}

  // Listar archivos de una entidad (ej: todas las fotos de una visita)
  async findByEntity(entityType: string, entityId: string, tenantId: string): Promise<Media[]> {
    return this.mediaRepo.find({
      where: { entityType, entityId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener un archivo por ID
  async findOne(id: string, tenantId: string): Promise<Media> {
    const media = await this.mediaRepo.findOne({ where: { id, tenantId } });
    if (!media) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return media;
  }

  // Registrar un archivo subido
  async create(dto: CreateMediaDto, uploadedById: string, tenantId: string): Promise<Media> {
    const media = this.mediaRepo.create({
      ...dto,
      uploadedById,
      tenantId,
    });
    return this.mediaRepo.save(media);
  }

  // Soft delete
  async remove(id: string, tenantId: string): Promise<void> {
    const media = await this.findOne(id, tenantId);
    await this.mediaRepo.softRemove(media);
  }
}
