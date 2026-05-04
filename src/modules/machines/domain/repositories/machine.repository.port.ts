import { MachineModel } from '../models/machine.model';

export interface MachineRepositoryPort {
  findAll(tenantId: string): Promise<MachineModel[]>;
  findOne(identifier: string, tenantId: string): Promise<MachineModel | null>;
  findById(id: string, tenantId: string): Promise<MachineModel | null>;
  create(machine: Partial<MachineModel>): Promise<MachineModel>;
  save(machine: MachineModel): Promise<MachineModel>;
  softRemove(machine: MachineModel): Promise<void>;
  
  // Specific cross-domain queries 
  getLastControlDetails(machineId: string, tenantId: string): Promise<any>;
  getRecentVisits(machineId: string, tenantId: string, limit: number): Promise<any[]>;
}
