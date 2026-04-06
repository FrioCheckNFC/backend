import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { KpisService } from './kpis.service';
import { CreateKpiDto, UpdateKpiDto } from './dto/kpi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@Controller('kpis')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Post()
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createKpiDto: CreateKpiDto) {
    return this.kpisService.create(createKpiDto);
  }

  @Get()
  @RequireRoles('ADMIN')
  findAll(@CurrentTenant() tenantId: string) {
    return this.kpisService.findAll(tenantId);
  }

  @Get('user/:userId')
  @RequireRoles('ADMIN')
  findByUser(
    @Param('userId') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.kpisService.findByUser(userId, tenantId);
  }

  @Get('sector/:sectorId')
  @RequireRoles('ADMIN')
  findBySector(
    @Param('sectorId') sectorId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.kpisService.findBySector(sectorId, tenantId);
  }

  @Get(':id')
  @RequireRoles('ADMIN')
  findById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.kpisService.findById(id, tenantId);
  }

  @Patch(':id')
  @RequireRoles('ADMIN')
  update(@Param('id') id: string, @Body() updateKpiDto: UpdateKpiDto) {
    return this.kpisService.update(id, updateKpiDto);
  }

  @Patch(':id/progress')
  @RequireRoles('ADMIN')
  updateProgress(
    @Param('id') id: string,
    @Body() body: { currentValue: number },
  ) {
    return this.kpisService.updateProgress(id, body.currentValue);
  }

  @Delete(':id')
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.kpisService.remove(id);
  }
}
