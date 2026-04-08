import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder } from './entities/work-order.entity';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from './dto/work-order.dto';
import { NfcTagsService } from '../nfc-tags/nfc-tags.service';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly repo: Repository<WorkOrder>,
    private readonly nfcTagsService: NfcTagsService,
  ) {}

  async create(dto: CreateWorkOrderDto, userId: string, tenantId: string): Promise<WorkOrder> {
    const workOrder = this.repo.create({
      ...dto,
      createdById: userId,
      tenantId,
      status: 'pending',
    });
    return this.repo.save(workOrder);
  }

  async findAll(tenantId: string, status?: string): Promise<WorkOrder[]> {
    const query = this.repo.createQueryBuilder('wo')
      .where('wo.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('wo.machine', 'machine')
      .leftJoinAndSelect('wo.assignedTo', 'assignedTo')
      .leftJoinAndSelect('wo.createdBy', 'createdBy');

    if (status) {
      query.andWhere('wo.status = :status', { status });
    }

    return query.orderBy('wo.createdAt', 'DESC').getMany();
  }

  async findById(id: string, tenantId: string): Promise<WorkOrder> {
    const workOrder = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['machine', 'assignedTo', 'createdBy'],
    });

    if (!workOrder) {
      throw new NotFoundException(`WorkOrder ${id} not found`);
    }

    return workOrder;
  }

  async validateNfcOnArrival(id: string, actualNfcUid: string, tenantId: string): Promise<WorkOrder> {
    const workOrder = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['machine'],
    });

    if (!workOrder) throw new NotFoundException('WorkOrder no encontrada');

    if (workOrder.status !== 'pending') {
      throw new BadRequestException('Esta orden ya no está pendiente');
    }

    if (!workOrder.machine) {
      throw new BadRequestException('Esta orden de trabajo no tiene una máquina asignada para validar NFC');
    }

    try {
      // Usar el servicio de NFC en lugar del repositorio directamente
      const machineTag = await this.nfcTagsService.findByMachineId(workOrder.machine.id, tenantId);
      const nfcMatches = machineTag && machineTag.uid === actualNfcUid;

      if (!nfcMatches) {
        workOrder.status = 'rejected';
        await this.repo.save(workOrder);
        throw new BadRequestException('Validación NFC fallida: el UID no coincide con la máquina.');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Esta máquina no tiene un tag NFC registrado en el sistema.');
      }
      throw error;
    }

    // Validación exitosa
    workOrder.status = 'in_progress';
    return this.repo.save(workOrder);
  }

  async completeWorkOrder(id: string, tenantId: string): Promise<WorkOrder> {
    const workOrder = await this.findById(id, tenantId);

    if (workOrder.status !== 'in_progress') {
      throw new BadRequestException('Deberías validar el NFC al llegar antes de completar la orden (status in_progress)');
    }

    workOrder.status = 'completed';
    workOrder.completedAt = new Date();
    return this.repo.save(workOrder);
  }

  async update(id: string, dto: UpdateWorkOrderDto, tenantId: string): Promise<WorkOrder> {
    const workOrder = await this.findById(id, tenantId);
    Object.assign(workOrder, dto);
    return this.repo.save(workOrder);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const workOrder = await this.findById(id, tenantId);
    await this.repo.softRemove(workOrder);
  }
}
