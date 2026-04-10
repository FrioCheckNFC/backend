import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { WorkOrder } from '../entities/work-order.entity';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '../dto/work-order.dto';
import { WorkOrderRepositoryPort } from '../repositories/work-order.repository.port';

@Injectable()
export class WorkOrdersService {
  constructor(
    @Inject('WORK_ORDER_REPOSITORY')
    private readonly workOrderRepository: WorkOrderRepositoryPort,
  ) {}

  async create(dto: CreateWorkOrderDto, createdById: string, tenantId: string): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepository.create({
      ...dto,
      createdById,
      tenantId,
      status: 'pending',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    return this.workOrderRepository.save(workOrder);
  }

  async findAll(tenantId: string, status?: string): Promise<WorkOrder[]> {
    return this.workOrderRepository.findAll(tenantId, status);
  }

  async findOne(id: string, tenantId: string): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepository.findOne(id, tenantId);
    if (!workOrder) {
      throw new NotFoundException(
        `Orden de Trabajo con ID ${id} no encontrada`,
      );
    }
    return workOrder;
  }

  async update(
    id: string,
    dto: UpdateWorkOrderDto,
    tenantId: string,
  ): Promise<WorkOrder> {
    const workOrder = await this.findOne(id, tenantId);
    Object.assign(workOrder, dto);
    if (dto.dueDate) workOrder.dueDate = new Date(dto.dueDate);
    return this.workOrderRepository.save(workOrder);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const workOrder = await this.findOne(id, tenantId);
    await this.workOrderRepository.softRemove(workOrder);
  }

  async validateNfcOnArrival(
    id: string,
    actualNfcUid: string,
    tenantId: string,
  ): Promise<WorkOrder> {
    const workOrder = await this.findOne(id, tenantId);

    if (!workOrder.machine || !(workOrder.machine as any).nfcTag) {
      throw new BadRequestException(
        'La máquina no tiene un tag NFC asociado para validar',
      );
    }

    const nfcTag = (workOrder.machine as any).nfcTag;
    if (nfcTag.uid !== actualNfcUid) {
      throw new BadRequestException('El tag NFC no coincide con la máquina asignada');
    }

    workOrder.status = 'in_progress';
    return this.workOrderRepository.save(workOrder);
  }

  async completeWorkOrder(id: string, tenantId: string): Promise<WorkOrder> {
    const workOrder = await this.findOne(id, tenantId);
    workOrder.status = 'completed';
    workOrder.completedAt = new Date();
    return this.workOrderRepository.save(workOrder);
  }
}
