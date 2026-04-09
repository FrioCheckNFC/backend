// tickets.service.ts
// Logica de negocio para tickets/ordenes de trabajo.
// ADMIN: ve todos los tickets, puede crear y asignar.
// TECHNICIAN: ve los tickets asignados a el, puede crearlos.

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,
  ) {}

  // Listar todos los tickets del tenant
  async findAll(tenantId: string): Promise<Ticket[]> {
    return this.ticketsRepo.find({
      where: { tenantId },
      relations: ['machine', 'createdBy', 'assignedTo'],
      order: { createdAt: 'DESC' },
    });
  }

  // Listar tickets asignados a un tecnico
  async findByAssignee(
    assignedToId: string,
    tenantId: string,
  ): Promise<Ticket[]> {
    return this.ticketsRepo.find({
      where: { assignedToId, tenantId },
      relations: ['machine', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener un ticket por ID
  async findOne(id: string, tenantId: string): Promise<Ticket> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id, tenantId },
      relations: ['machine', 'createdBy', 'assignedTo'],
    });
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    return ticket;
  }

  // Crear un ticket
  async create(
    dto: CreateTicketDto,
    createdById: string,
    tenantId: string,
  ): Promise<Ticket> {
    const ticket = this.ticketsRepo.create({
      ...dto,
      createdById,
      tenantId,
    });
    return this.ticketsRepo.save(ticket);
  }

  // Actualizar un ticket
  async update(
    id: string,
    dto: UpdateTicketDto,
    tenantId: string,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id, tenantId);
    Object.assign(ticket, dto);
    return this.ticketsRepo.save(ticket);
  }

  // Soft delete
  async remove(id: string, tenantId: string): Promise<void> {
    const ticket = await this.findOne(id, tenantId);
    await this.ticketsRepo.softRemove(ticket);
  }
}
