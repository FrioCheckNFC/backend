import { Ticket } from '../entities/ticket.entity';

export interface TicketRepositoryPort {
  findAll(tenantId: string): Promise<Ticket[]>;
  findOne(id: string, tenantId: string): Promise<Ticket | null>;
  create(ticket: Partial<Ticket>): Promise<Ticket>;
  save(ticket: Ticket): Promise<Ticket>;
  softRemove(ticket: Ticket): Promise<void>;
}
