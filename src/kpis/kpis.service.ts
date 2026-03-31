import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Kpi } from './entities/kpi.entity';
import { CreateKpiDto, UpdateKpiDto } from './dto/kpi.dto';

@Injectable()
export class KpisService {
  constructor(
    @InjectRepository(Kpi)
    private readonly kpiRepository: Repository<Kpi>,
  ) {}

  async create(createKpiDto: CreateKpiDto): Promise<Kpi> {
    const kpi = this.kpiRepository.create(createKpiDto);
    return this.kpiRepository.save(kpi);
  }

  async findAll(tenantId: string): Promise<Kpi[]> {
    return this.kpiRepository.find({
      where: { tenantId },
      relations: ['user', 'sector'],
      order: { endDate: 'DESC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<Kpi> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const kpi = await this.kpiRepository.findOne({
      where,
      relations: ['user', 'sector'],
    });
    if (!kpi) {
      throw new NotFoundException(`KPI with ID ${id} not found`);
    }

    return kpi;
  }

  async findByUser(userId: string, tenantId: string): Promise<Kpi[]> {
    return this.kpiRepository.find({
      where: { userId, tenantId },
      relations: ['sector'],
      order: { endDate: 'DESC' },
    });
  }

  async findBySector(sectorId: string, tenantId: string): Promise<Kpi[]> {
    return this.kpiRepository.find({
      where: { sectorId, tenantId },
      relations: ['user'],
      order: { endDate: 'DESC' },
    });
  }

  async updateProgress(id: string, currentValue: number): Promise<Kpi> {
    const kpi = await this.findById(id);
    kpi.currentValue = currentValue;
    return this.kpiRepository.save(kpi);
  }

  async update(id: string, updateKpiDto: UpdateKpiDto): Promise<Kpi> {
    const kpi = await this.findById(id);
    Object.assign(kpi, updateKpiDto);
    return this.kpiRepository.save(kpi);
  }

  async remove(id: string): Promise<void> {
    const kpi = await this.findById(id);
    await this.kpiRepository.softRemove(kpi);
  }
}
