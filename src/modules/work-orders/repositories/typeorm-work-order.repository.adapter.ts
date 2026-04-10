import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder } from '../entities/work-order.entity';
import { WorkOrderRepositoryPort } from './work-order.repository.port';

@Injectable()
export class TypeOrmWorkOrderRepositoryAdapter
  implements WorkOrderRepositoryPort
{
  constructor(
    @InjectRepository(WorkOrder)
    private readonly repo: Repository<WorkOrder>,
  ) {}

  async findAll(tenantId: string, status?: string): Promise<WorkOrder[]> {
    const where: any = { tenantId };
    if (status) where.status = status;
    return this.repo.find({
      where,
      relations: ['createdBy', 'assignedTo', 'machine', 'machine.nfcTag'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<WorkOrder | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['createdBy', 'assignedTo', 'machine', 'machine.nfcTag'],
    });
  }

  async create(workOrder: Partial<WorkOrder>): Promise<WorkOrder> {
    const newWorkOrder = this.repo.create(workOrder);
    return this.repo.save(newWorkOrder);
  }

  async save(workOrder: WorkOrder): Promise<WorkOrder> {
    return this.repo.save(workOrder);
  }

  async softRemove(workOrder: WorkOrder): Promise<void> {
    await this.repo.softRemove(workOrder);
  }
}
