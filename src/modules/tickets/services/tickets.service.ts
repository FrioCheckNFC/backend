import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Ticket } from '../entities/ticket.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketRepositoryPort } from '../repositories/ticket.repository.port';

@Injectable()
export class TicketsService {
  constructor(
    @Inject('TICKET_REPOSITORY')
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async create(createTicketDto: CreateTicketDto, tenantId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.create({
      ...createTicketDto,
      tenantId,
      status: 'open',
    });
    return this.ticketRepository.save(ticket);
  }

  async findAll(tenantId: string): Promise<Ticket[]> {
    return this.ticketRepository.findAll(tenantId);
  }

  async findOne(id: string, tenantId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne(id, tenantId);
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }
    return ticket;
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    tenantId: string,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id, tenantId);
    Object.assign(ticket, updateTicketDto);
    return this.ticketRepository.save(ticket);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const ticket = await this.findOne(id, tenantId);
    await this.ticketRepository.softRemove(ticket);
  }
}
