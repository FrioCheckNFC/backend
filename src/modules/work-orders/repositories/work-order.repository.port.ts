import { WorkOrder } from '../entities/work-order.entity';

export interface WorkOrderRepositoryPort {
  findAll(tenantId: string, status?: string): Promise<WorkOrder[]>;
  findOne(id: string, tenantId: string): Promise<WorkOrder | null>;
  create(workOrder: Partial<WorkOrder>): Promise<WorkOrder>;
  save(workOrder: WorkOrder): Promise<WorkOrder>;
  softRemove(workOrder: WorkOrder): Promise<void>;
}
