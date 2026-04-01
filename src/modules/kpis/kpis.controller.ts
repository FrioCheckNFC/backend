import {
  Controller, Post, Get, Patch, Delete,
  Param, Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KpisService } from './kpis.service';
import { CreateKpiDto, UpdateKpiDto } from './dto/kpi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('KPIs')
@ApiBearerAuth()
@Controller('kpis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un KPI' })
  create(@Body() dto: CreateKpiDto, @Req() req) {
    return this.kpisService.create(dto, req.user.tenantId);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar KPIs del tenant' })
  findAll(@Req() req) {
    return this.kpisService.findAll(req.user.tenantId);
  }

  @Get('user/:userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'KPIs de un usuario' })
  findByUser(@Param('userId') userId: string, @Req() req) {
    return this.kpisService.findByUser(userId, req.user.tenantId);
  }

  @Get('sector/:sectorId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'KPIs de un sector' })
  findBySector(@Param('sectorId') sectorId: string, @Req() req) {
    return this.kpisService.findBySector(sectorId, req.user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener un KPI por ID' })
  findById(@Param('id') id: string, @Req() req) {
    return this.kpisService.findById(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un KPI' })
  update(@Param('id') id: string, @Body() dto: UpdateKpiDto) {
    return this.kpisService.update(id, dto);
  }

  @Patch(':id/progress')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar progreso de un KPI' })
  updateProgress(@Param('id') id: string, @Body() body: { currentValue: number }) {
    return this.kpisService.updateProgress(id, body.currentValue);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un KPI (soft delete)' })
  remove(@Param('id') id: string) {
    return this.kpisService.remove(id);
  }
}
