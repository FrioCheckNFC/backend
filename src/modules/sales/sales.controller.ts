import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles('ADMIN', 'VENDOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una venta' })
  create(@Body() dto: CreateSaleDto, @Req() req) {
    return this.salesService.create(dto, req.user.tenantId);
  }

  @Get()
  @Roles('ADMIN', 'VENDOR')
  @ApiOperation({ summary: 'Listar ventas del tenant' })
  findAll(@Req() req) {
    return this.salesService.findAll(req.user.tenantId);
  }

  @Get('metrics/by-vendor')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Métricas de ventas agrupadas por vendedor' })
  getMetricsByVendor(@Req() req) {
    return this.salesService.getMetricsByVendor(req.user.tenantId);
  }

  @Get('metrics/by-sector')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Métricas de ventas agrupadas por sector' })
  getMetricsBySector(@Req() req) {
    return this.salesService.getMetricsBySector(req.user.tenantId);
  }

  @Get('vendor/:vendorId')
  @Roles('ADMIN', 'VENDOR')
  @ApiOperation({ summary: 'Ventas de un vendedor específico' })
  findByVendor(@Param('vendorId') vendorId: string, @Req() req) {
    return this.salesService.findByVendor(vendorId, req.user.tenantId);
  }

  @Get('sector/:sectorId')
  @Roles('ADMIN', 'VENDOR')
  @ApiOperation({ summary: 'Ventas de un sector específico' })
  findBySector(@Param('sectorId') sectorId: string, @Req() req) {
    return this.salesService.findBySector(sectorId, req.user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'VENDOR')
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  findById(@Param('id') id: string, @Req() req) {
    return this.salesService.findById(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una venta' })
  update(@Param('id') id: string, @Body() dto: UpdateSaleDto) {
    return this.salesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una venta (soft delete)' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
