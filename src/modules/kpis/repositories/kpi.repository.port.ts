import { Kpi } from '../entities/kpi.entity';

export interface KpiRepositoryPort {
  findAll(tenantId: string): Promise<Kpi[]>;
  findById(id: string, tenantId?: string): Promise<Kpi | null>;
  findByUser(userId: string, tenantId: string): Promise<Kpi[]>;
  findBySector(sectorId: string, tenantId: string): Promise<Kpi[]>;
  create(kpi: Partial<Kpi>): Promise<Kpi>;
  save(kpi: Kpi): Promise<Kpi>;
  softRemove(kpi: Kpi): Promise<void>;
}
