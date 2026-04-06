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
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
import { TicketType } from './entities/ticket.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @RequireRoles('ADMIN', 'TECHNICIAN', 'VENDOR', 'RETAILER')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @RequireRoles('ADMIN', 'TECHNICIAN', 'VENDOR', 'RETAILER')
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('type') type?: TicketType,
  ) {
    return this.ticketsService.findAll(tenantId, type);
  }

  @Get('open')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'VENDOR', 'RETAILER')
  findOpenTickets(@CurrentTenant() tenantId: string) {
    return this.ticketsService.findOpenTickets(tenantId);
  }

  // Specific routes BEFORE generic :id to avoid route conflicts
  @Get('metrics')
  @RequireRoles('ADMIN')
  getMetricsByType(@CurrentTenant() tenantId: string) {
    return this.ticketsService.getTicketMetricsByType(tenantId);
  }

  @Get('sla')
  @RequireRoles('ADMIN')
  getAverageSLA(@CurrentTenant() tenantId: string) {
    return this.ticketsService.getAverageSLA(tenantId);
  }

  @Get(':id')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'VENDOR', 'RETAILER')
  findById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.ticketsService.findById(id, tenantId);
  }

  @Patch(':id')
  @RequireRoles('ADMIN', 'TECHNICIAN')
  update(@Param('id') id: string, @Body() updateDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateDto);
  }

  @Post(':id/resolve')
  @RequireRoles('ADMIN', 'TECHNICIAN')
  @HttpCode(HttpStatus.OK)
  resolve(
    @Param('id') id: string,
    @Body() body: { updateDto: UpdateTicketDto },
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.resolve(id, body.updateDto, user.id);
  }
}
