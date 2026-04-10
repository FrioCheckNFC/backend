import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sector } from '../entities/sector.entity';
import { CreateSectorDto, UpdateSectorDto } from '../dto/sector.dto';
import { SectorRepositoryPort } from '../repositories/sector.repository.port';

@Injectable()
export class SectorsService {
  constructor(
    @Inject('SECTOR_REPOSITORY')
    private readonly sectorRepository: SectorRepositoryPort,
  ) {}

  async create(dto: CreateSectorDto, tenantId: string): Promise<Sector> {
    return this.sectorRepository.create({ ...dto, tenantId });
  }

  async findOrCreateByGeography(
    comuna: string,
    city: string,
    tenantId: string,
  ): Promise<Sector> {
    let sector = await this.sectorRepository.findByGeography(comuna, city, tenantId);

    if (!sector) {
      sector = await this.create(
        {
          comuna,
          city,
        },
        tenantId,
      );
    }

    return sector;
  }

  async findAll(tenantId: string): Promise<Sector[]> {
    return this.sectorRepository.findAll(tenantId);
  }

  async findById(id: string, tenantId?: string): Promise<Sector> {
    const sector = await this.sectorRepository.findById(id, tenantId);
    if (!sector) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }
    return sector;
  }

  async update(id: string, dto: UpdateSectorDto): Promise<Sector> {
    const sector = await this.findById(id);
    Object.assign(sector, dto);
    return this.sectorRepository.save(sector);
  }

  async remove(id: string): Promise<void> {
    const sector = await this.findById(id);
    await this.sectorRepository.softRemove(sector);
  }
}
