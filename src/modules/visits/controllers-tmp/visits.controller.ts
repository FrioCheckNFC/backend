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
import { VisitsService } from '../services/visits.service';
import { CreateVisitDto } from '../dto/create-visit.dto';
import { UpdateVisitDto } from '../dto/update-visit.dto';
import { VisitActionDto } from '../dto/visit-action.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las visitas (Admin ve todas, Técnico solo las suyas)' })
  findAll(@Request() req) {
    if (req.user.role.includes('ADMIN')) {
      return this.visitsService.findAll(req.user.tenantId);
    }
    return this.visitsService.findByTechnician(req.user.id, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener visita por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.visitsService.findOne(id, req.user.tenantId);
  }

  @Post()
  @Roles('TECHNICIAN', 'ADMIN')
  @ApiOperation({ summary: 'Crear una visita manual' })
  create(@Body() createVisitDto: CreateVisitDto, @Request() req) {
    return this.visitsService.create(createVisitDto, req.user.id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('TECHNICIAN', 'ADMIN')
  @ApiOperation({ summary: 'Actualizar visita' })
  update(
    @Param('id') id: string,
    @Body() updateVisitDto: UpdateVisitDto,
    @Request() req,
  ) {
    return this.visitsService.update(
      id,
      updateVisitDto,
      req.user.tenantId,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar visita (Solo Admin)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.visitsService.remove(id, req.user.tenantId);
  }

  @Post('check-in')
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Realizar Check-In (Abre visita)' })
  checkIn(@Body() dto: VisitActionDto, @Request() req) {
    return this.visitsService.checkIn(dto, req.user.id, req.user.tenantId);
  }

  @Post(':id/check-out')
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Realizar Check-Out (Cierra visita)' })
  checkOut(
    @Param('id') id: string,
    @Body() dto: Omit<VisitActionDto, 'machineId'>,
    @Request() req,
  ) {
    return this.visitsService.checkOut(id, dto, req.user.id, req.user.tenantId);
  }
}
