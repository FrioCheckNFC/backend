import { Sector } from '../entities/sector.entity';

export interface SectorRepositoryPort {
  findAll(tenantId: string): Promise<Sector[]>;
  findById(id: string, tenantId?: string): Promise<Sector | null>;
  create(sector: Partial<Sector>): Promise<Sector>;
  save(sector: Sector): Promise<Sector>;
  softRemove(sector: Sector): Promise<void>;
}
