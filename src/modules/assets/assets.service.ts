// assets.service.ts
// CRUD de equipos de refrigeracion, filtrado por tenant.
// Un admin solo ve los equipos de su empresa.

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepo: Repository<Asset>,
  ) {}

  // Listar equipos del tenant
  async findAll(tenantId: string): Promise<Asset[]> {
    return this.assetsRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener un equipo por ID (del mismo tenant)
  async findOne(id: string, tenantId: string): Promise<Asset> {
    const asset = await this.assetsRepo.findOne({ where: { id, tenantId } });
    if (!asset) {
      throw new NotFoundException('Equipo no encontrado');
    }
    return asset;
  }

  // Buscar equipo por tag NFC (lo usa el tecnico cuando escanea)
  async findByNfc(nfcTagId: string, tenantId: string): Promise<Asset> {
    const asset = await this.assetsRepo.findOne({ where: { nfcTagId, tenantId } });
    if (!asset) {
      throw new NotFoundException('No se encontro un equipo con ese tag NFC');
    }
    return asset;
  }

  // Crear un equipo nuevo
  async create(dto: CreateAssetDto, tenantId: string): Promise<Asset> {
    // Si tiene tag NFC, verificar que no este en uso
    if (dto.nfcTagId) {
      const exists = await this.assetsRepo.findOne({ where: { nfcTagId: dto.nfcTagId } });
      if (exists) {
        throw new BadRequestException('Ese tag NFC ya esta asignado a otro equipo');
      }
    }

    const asset = this.assetsRepo.create({ ...dto, tenantId });
    return this.assetsRepo.save(asset);
  }

  // Actualizar un equipo
  async update(id: string, dto: UpdateAssetDto, tenantId: string): Promise<Asset> {
    const asset = await this.findOne(id, tenantId);

    // Si cambian el tag NFC, verificar que no este en uso por otro equipo
    if (dto.nfcTagId && dto.nfcTagId !== asset.nfcTagId) {
      const nfcTaken = await this.assetsRepo.findOne({ where: { nfcTagId: dto.nfcTagId } });
      if (nfcTaken) {
        throw new BadRequestException('Ese tag NFC ya esta asignado a otro equipo');
      }
    }

    Object.assign(asset, dto);
    return this.assetsRepo.save(asset);
  }

  // Soft delete
  async remove(id: string, tenantId: string): Promise<void> {
    const asset = await this.findOne(id, tenantId);
    await this.assetsRepo.softRemove(asset);
  }
}
