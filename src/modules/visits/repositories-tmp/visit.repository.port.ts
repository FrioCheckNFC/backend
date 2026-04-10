import { Visit } from '../entities/visit.entity';

export interface VisitRepositoryPort {
  findAll(tenantId: string): Promise<Visit[]>;
  findByTechnician(technicianId: string, tenantId: string): Promise<Visit[]>;
  findOne(id: string, tenantId: string): Promise<Visit | null>;
  findPending(technicianId: string, machineId: string): Promise<Visit | null>;
  create(visit: Partial<Visit>): Promise<Visit>;
  save(visit: Visit): Promise<Visit>;
  softRemove(visit: Visit): Promise<void>;
}
