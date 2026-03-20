import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder, WorkOrderStatus } from './entities/work-order.entity';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from './dto/work-order.dto';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workOrderRepository: Repository<WorkOrder>,
  ) {}

  async create(createWorkOrderDto: CreateWorkOrderDto): Promise<WorkOrder> {
    const workOrder = this.workOrderRepository.create({
      ...createWorkOrderDto,
      status: WorkOrderStatus.PENDIENTE,
    });

    return this.workOrderRepository.save(workOrder);
  }

  async findAll(tenantId: string, status?: WorkOrderStatus): Promise<WorkOrder[]> {
    const query = this.workOrderRepository
      .createQueryBuilder('workOrder')
      .where('workOrder.tenant_id = :tenantId', { tenantId })
      .leftJoinAndSelect('workOrder.machine', 'machine')
      .leftJoinAndSelect('workOrder.assignedUser', 'user')
      .leftJoinAndSelect('workOrder.visit', 'visit')
      .leftJoinAndSelect('workOrder.attachments', 'attachments');

    if (status) {
      query.andWhere('workOrder.status = :status', { status });
    }

    return query.orderBy('workOrder.created_at', 'DESC').getMany();
  }

  async findById(id: string): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id },
      relations: ['machine', 'assignedUser', 'visit', 'attachments', 'tenant'],
    });

    if (!workOrder) {
      throw new NotFoundException(`WorkOrder with ID ${id} not found`);
    }

    return workOrder;
  }

  // Validar que el NFC coincida con lo esperado en la orden
  async validateNfcOnArrival(
    workOrderId: string,
    actualNfcUid: string,
  ): Promise<WorkOrder> {
    const workOrder = await this.findById(workOrderId);

    if (workOrder.status !== WorkOrderStatus.PENDIENTE) {
      throw new BadRequestException('WorkOrder is not in pending status');
    }

    const nfcMatches = workOrder.expectedNfcUid === actualNfcUid;

    if (!nfcMatches) {
      workOrder.status = WorkOrderStatus.RECHAZADO;
      workOrder.rejectionReason = 'NFC UID does not match. Possible fraud or wrong location.';
      await this.workOrderRepository.save(workOrder);
      throw new BadRequestException(
        'NFC validation failed: UID does not match expected value. Order blocked.',
      );
    }

    workOrder.actualNfcUid = actualNfcUid;
    workOrder.nfcValidated = true;
    workOrder.status = WorkOrderStatus.EN_TRANSITO;

    return this.workOrderRepository.save(workOrder);
  }

  async markAsDelivered(id: string, updateDto: UpdateWorkOrderDto): Promise<WorkOrder> {
    const workOrder = await this.findById(id);

    if (!workOrder.nfcValidated) {
      throw new BadRequestException('WorkOrder NFC must be validated before delivery');
    }

    workOrder.status = WorkOrderStatus.ENTREGADO;
    workOrder.deliveryDate = new Date();
    Object.assign(workOrder, updateDto);

    return this.workOrderRepository.save(workOrder);
  }

  async update(id: string, updateDto: UpdateWorkOrderDto): Promise<WorkOrder> {
    const workOrder = await this.findById(id);
    Object.assign(workOrder, updateDto);
    return this.workOrderRepository.save(workOrder);
  }
}
