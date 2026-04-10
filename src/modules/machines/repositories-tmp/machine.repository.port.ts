import { Machine } from '../entities/machine.entity';

export interface MachineRepositoryPort {
  findAll(tenantId: string): Promise<Machine[]>;
  findOne(id: string, tenantId: string): Promise<Machine | null>;
  create(machine: Partial<Machine>): Promise<Machine>;
  save(machine: Machine): Promise<Machine>;
  softRemove(machine: Machine): Promise<void>;
  
  // Specific queries
  getLastControlDetails(machineId: string, tenantId: string): Promise<any>;
  getRecentVisits(machineId: string, tenantId: string, limit: number): Promise<any[]>;
}
