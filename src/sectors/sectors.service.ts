import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sector } from './entities/sector.entity';
import { CreateSectorDto, UpdateSectorDto } from './dto/sector.dto';

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
  ) {}

  async create(createSectorDto: CreateSectorDto): Promise<Sector> {
    const sector = this.sectorRepository.create(createSectorDto);
    return this.sectorRepository.save(sector);
  }

  async findAll(tenantId: string): Promise<Sector[]> {
    return this.sectorRepository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<Sector> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const sector = await this.sectorRepository.findOne({ where });
    if (!sector) {
      throw new NotFoundException(`Sector with ID ${id} not found`);
    }

    return sector;
  }

  async update(id: string, updateSectorDto: UpdateSectorDto): Promise<Sector> {
    const sector = await this.findById(id);
    Object.assign(sector, updateSectorDto);
    return this.sectorRepository.save(sector);
  }

  async remove(id: string): Promise<void> {
    const sector = await this.findById(id);
    await this.sectorRepository.softRemove(sector);
  }
}
