import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sector } from './entities/sector.entity';
import { CreateSectorDto, UpdateSectorDto } from './dto/sector.dto';

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    private readonly sectorRepo: Repository<Sector>,
  ) {}

  async create(dto: CreateSectorDto, tenantId: string): Promise<any> {
    const sector = this.sectorRepo.create({ ...dto, tenantId } as any);
    return this.sectorRepo.save(sector);
  }

  async findAll(tenantId: string): Promise<any[]> {
    return this.sectorRepo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<any> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const sector = await this.sectorRepo.findOne({ where });
    if (!sector) throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    return sector;
  }

  async update(id: string, dto: UpdateSectorDto): Promise<any> {
    const sector = await this.findById(id);
    Object.assign(sector, dto);
    return this.sectorRepo.save(sector);
  }

  async remove(id: string): Promise<void> {
    const sector = await this.findById(id);
    await this.sectorRepo.softRemove(sector);
  }
}

