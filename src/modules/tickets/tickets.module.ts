import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './services/tickets.service';
import { TicketsController } from './controllers/tickets.controller';
import { TypeOrmTicketRepositoryAdapter } from './repositories/typeorm-ticket.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    {
      provide: 'TICKET_REPOSITORY',
      useClass: TypeOrmTicketRepositoryAdapter,
    },
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
