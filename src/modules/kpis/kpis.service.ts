import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kpi } from './entities/kpi.entity';
import { CreateKpiDto, UpdateKpiDto } from './dto/kpi.dto';

@Injectable()
export class KpisService {
  constructor(
    @InjectRepository(Kpi)
    private readonly kpiRepo: Repository<Kpi>,
  ) {}

  async create(dto: CreateKpiDto, tenantId: string): Promise<any> {
    const kpi = this.kpiRepo.create({ ...dto, tenantId } as any);
    return this.kpiRepo.save(kpi);
  }

  async findAll(tenantId: string): Promise<any[]> {
    return this.kpiRepo.find({
      where: { tenantId },
      relations: ['user', 'sector'],
      order: { endDate: 'DESC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<any> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const kpi = await this.kpiRepo.findOne({
      where,
      relations: ['user', 'sector'],
    });
    if (!kpi) throw new NotFoundException(`KPI con ID ${id} no encontrado`);
    return kpi;
  }

  async findByUser(userId: string, tenantId: string): Promise<any[]> {
    return this.kpiRepo.find({
      where: { userId, tenantId },
      relations: ['sector'],
      order: { endDate: 'DESC' },
    });
  }

  async findBySector(sectorId: string, tenantId: string): Promise<any[]> {
    return this.kpiRepo.find({
      where: { sectorId, tenantId },
      relations: ['user'],
      order: { endDate: 'DESC' },
    });
  }

  async updateProgress(id: string, currentValue: number): Promise<any> {
    const kpi = await this.findById(id);
    kpi.currentValue = currentValue;
    return this.kpiRepo.save(kpi);
  }

  async update(id: string, dto: UpdateKpiDto): Promise<any> {
    const kpi = await this.findById(id);
    Object.assign(kpi, dto);
    return this.kpiRepo.save(kpi);
  }

  async remove(id: string): Promise<void> {
    const kpi = await this.findById(id);
    await this.kpiRepo.softRemove(kpi);
  }
}

