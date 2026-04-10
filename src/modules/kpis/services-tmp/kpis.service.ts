import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Kpi, KpiType } from '../entities/kpi.entity';
import { CreateKpiDto, UpdateKpiDto } from '../dto/kpi.dto';
import { KpiRepositoryPort } from '../repositories/kpi.repository.port';

@Injectable()
export class KpisService {
  constructor(
    @Inject('KPI_REPOSITORY')
    private readonly kpiRepository: KpiRepositoryPort,
  ) {}

  async create(dto: CreateKpiDto, tenantId: string): Promise<Kpi> {
    const kpiData: Partial<Kpi> = {
      ...dto,
      tenantId,
      type: dto.type as KpiType,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    };
    return this.kpiRepository.create(kpiData);
  }

  async findAll(tenantId: string): Promise<Kpi[]> {
    return this.kpiRepository.findAll(tenantId);
  }

  async findById(id: string, tenantId?: string): Promise<Kpi> {
    const kpi = await this.kpiRepository.findById(id, tenantId);
    if (!kpi) {
      throw new NotFoundException(`KPI con ID ${id} no encontrado`);
    }
    return kpi;
  }

  async findByUser(userId: string, tenantId: string): Promise<Kpi[]> {
    return this.kpiRepository.findByUser(userId, tenantId);
  }

  async findBySector(sectorId: string, tenantId: string): Promise<Kpi[]> {
    return this.kpiRepository.findBySector(sectorId, tenantId);
  }

  async updateProgress(id: string, currentValue: number): Promise<Kpi> {
    const kpi = await this.findById(id);
    kpi.currentValue = currentValue;
    return this.kpiRepository.save(kpi);
  }

  async update(id: string, dto: UpdateKpiDto): Promise<Kpi> {
    const kpi = await this.findById(id);
    Object.assign(kpi, dto);
    if (dto.type) kpi.type = dto.type as KpiType;
    if (dto.startDate) kpi.startDate = new Date(dto.startDate);
    if (dto.endDate) kpi.endDate = new Date(dto.endDate);
    return this.kpiRepository.save(kpi);
  }

  async remove(id: string): Promise<void> {
    const kpi = await this.findById(id);
    await this.kpiRepository.softRemove(kpi);
  }
}
