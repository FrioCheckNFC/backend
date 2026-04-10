import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TicketsService } from '../services/tickets.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un ticket de soporte' })
  create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    return this.ticketsService.create(createTicketDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tickets del tenant' })
  findAll(@Request() req) {
    return this.ticketsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ticket por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.ticketsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Actualizar ticket (Solo Admin/Support)' })
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    return this.ticketsService.update(id, updateTicketDto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar ticket (Solo Admin)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.ticketsService.remove(id, req.user.tenantId);
  }
}
