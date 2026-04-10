import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { TicketRepositoryPort } from './ticket.repository.port';

@Injectable()
export class TypeOrmTicketRepositoryAdapter implements TicketRepositoryPort {
  constructor(
    @InjectRepository(Ticket)
    private readonly repo: Repository<Ticket>,
  ) {}

  async findAll(tenantId: string): Promise<Ticket[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['machine'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Ticket | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['machine'],
    });
  }

  async create(ticket: Partial<Ticket>): Promise<Ticket> {
    const newTicket = this.repo.create(ticket);
    return this.repo.save(newTicket);
  }

  async save(ticket: Ticket): Promise<Ticket> {
    return this.repo.save(ticket);
  }

  async softRemove(ticket: Ticket): Promise<void> {
    await this.repo.softRemove(ticket);
  }
}
