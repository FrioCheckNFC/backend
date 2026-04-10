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
import { SalesService } from '../services/sales.service';
import { CreateSaleDto, UpdateSaleDto } from '../dto/sale.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Registrar una nueva venta (Solo Admin)' })
  create(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    return this.salesService.create(createSaleDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las ventas del tenant' })
  findAll(@Request() req) {
    return this.salesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener venta por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.salesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar venta (Solo Admin)' })
  update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @Request() req,
  ) {
    return this.salesService.update(id, updateSaleDto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar venta (Solo Admin)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.salesService.remove(id, req.user.tenantId);
  }
}
