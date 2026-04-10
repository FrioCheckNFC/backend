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
import { KpisService } from '../services/kpis.service';
import { CreateKpiDto, UpdateKpiDto } from '../dto/kpi.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('KPIs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('kpis')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo KPI (Solo Admin)' })
  create(@Body() createKpiDto: CreateKpiDto, @Request() req) {
    return this.kpisService.create(createKpiDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los KPIs del tenant' })
  findAll(@Request() req) {
    return this.kpisService.findAll(req.user.tenantId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar KPIs por usuario' })
  findByUser(@Param('userId') userId: string, @Request() req) {
    return this.kpisService.findByUser(userId, req.user.tenantId);
  }

  @Get('sector/:sectorId')
  @ApiOperation({ summary: 'Listar KPIs por sector' })
  findBySector(@Param('sectorId') sectorId: string, @Request() req) {
    return this.kpisService.findBySector(sectorId, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener KPI por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.kpisService.findById(id, req.user.tenantId);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Actualizar progreso de un KPI' })
  updateProgress(
    @Param('id') id: string,
    @Body('currentValue') currentValue: number,
  ) {
    return this.kpisService.updateProgress(id, currentValue);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar configuración de KPI (Solo Admin)' })
  update(@Param('id') id: string, @Body() updateKpiDto: UpdateKpiDto) {
    return this.kpisService.update(id, updateKpiDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar KPI (Solo Admin)' })
  remove(@Param('id') id: string) {
    return this.kpisService.remove(id);
  }
}
