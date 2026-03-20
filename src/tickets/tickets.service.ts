import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketType } from './entities/ticket.entity';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  // Crear ticket: Puede ser por NFC o entrada manual (foto de placa)
  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      status: TicketStatus.ABIERTO,
    });

    return this.ticketRepository.save(ticket);
  }

  async findAll(tenantId: string, type?: TicketType): Promise<Ticket[]> {
    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .where('ticket.tenant_id = :tenantId', { tenantId })
      .leftJoinAndSelect('ticket.machine', 'machine')
      .leftJoinAndSelect('ticket.reportedBy', 'reportedBy')
      .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
      .leftJoinAndSelect('ticket.resolvedBy', 'resolvedBy')
      .leftJoinAndSelect('ticket.attachments', 'attachments');

    if (type) {
      query.andWhere('ticket.type = :type', { type });
    }

    return query.orderBy('ticket.created_at', 'DESC').getMany();
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: [
        'machine',
        'reportedBy',
        'assignedTo',
        'resolvedBy',
        'attachments',
        'tenant',
      ],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async findOpenTickets(tenantId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: {
        tenant: { id: tenantId },
        status: TicketStatus.ABIERTO,
      },
      relations: ['machine', 'reportedBy', 'assignedTo'],
      order: { createdAt: 'DESC' },
    });
  }

  // Resolver un ticket (cierre)
  async resolve(
    id: string,
    updateDto: UpdateTicketDto,
    resolvedById: string,
  ): Promise<Ticket> {
    const ticket = await this.findById(id);

    ticket.status = TicketStatus.CERRADO;
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = { id: resolvedById } as any;

    Object.assign(ticket, updateDto);

    return this.ticketRepository.save(ticket);
  }

  async update(id: string, updateDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);
    Object.assign(ticket, updateDto);
    return this.ticketRepository.save(ticket);
  }

  // Soporte para entrada manual (sin NFC)
  // Si no se puede usar NFC, se acepta foto de placa o ID manual
  async canReportWithoutNfc(ticket: Ticket): Promise<boolean> {
    return (
      ticket.canUseManualEntry &&
      !!(ticket.manualMachineId || ticket.machinePhotoPlateUrl)
    );
  }

  // Métricas de KPI
  async getTicketMetricsByType(tenantId: string): Promise<any> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .select('ticket.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.tenant_id = :tenantId', { tenantId })
      .groupBy('ticket.type')
      .getRawMany();
  }

  async getAverageSLA(tenantId: string): Promise<number> {
    const result = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('AVG(ticket.time_spent_minutes)', 'averageTime')
      .where('ticket.tenant_id = :tenantId', { tenantId })
      .andWhere('ticket.status = :status', { status: TicketStatus.CERRADO })
      .getRawOne();

    return result?.averageTime || 0;
  }
}
