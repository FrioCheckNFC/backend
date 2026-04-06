import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @RequireRoles('ADMIN', 'VENDOR')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @RequireRoles('ADMIN', 'VENDOR')
  findAll(@CurrentTenant() tenantId: string) {
    return this.salesService.findAll(tenantId);
  }

  @Get('metrics/by-vendor')
  @RequireRoles('ADMIN')
  getMetricsByVendor(@CurrentTenant() tenantId: string) {
    return this.salesService.getMetricsByVendor(tenantId);
  }

  @Get('metrics/by-sector')
  @RequireRoles('ADMIN')
  getMetricsBySector(@CurrentTenant() tenantId: string) {
    return this.salesService.getMetricsBySector(tenantId);
  }

  @Get('vendor/:vendorId')
  @RequireRoles('ADMIN', 'VENDOR')
  findByVendor(
    @Param('vendorId') vendorId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.salesService.findByVendor(vendorId, tenantId);
  }

  @Get('sector/:sectorId')
  @RequireRoles('ADMIN', 'VENDOR')
  findBySector(
    @Param('sectorId') sectorId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.salesService.findBySector(sectorId, tenantId);
  }

  @Get(':id')
  @RequireRoles('ADMIN', 'VENDOR')
  findById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.salesService.findById(id, tenantId);
  }

  @Patch(':id')
  @RequireRoles('ADMIN')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Delete(':id')
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
