import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
import { TicketType } from './entities/ticket.entity';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('type') type?: TicketType,
  ) {
    return this.ticketsService.findAll(tenantId, type);
  }

  @Get('open')
  findOpenTickets(@Query('tenantId') tenantId: string) {
    return this.ticketsService.findOpenTickets(tenantId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateDto);
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  resolve(
    @Param('id') id: string,
    @Body() body: { updateDto: UpdateTicketDto; resolvedById: string },
  ) {
    return this.ticketsService.resolve(id, body.updateDto, body.resolvedById);
  }

  @Get('metrics/:tenantId')
  getMetricsByType(@Param('tenantId') tenantId: string) {
    return this.ticketsService.getTicketMetricsByType(tenantId);
  }

  @Get('sla/:tenantId')
  getAverageSLA(@Param('tenantId') tenantId: string) {
    return this.ticketsService.getAverageSLA(tenantId);
  }
}
