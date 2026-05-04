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
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../dto/inventory.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/http/guards/roles.guard';
import { TenantGuard } from '../../auth/infrastructure/http/guards/tenant.guard';
import { Roles } from '../../auth/infrastructure/http/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Agregar nuevo ítem al inventario (Solo Admin)' })
  create(@Body() dto: CreateInventoryDto, @Request() req) {
    return this.inventoryService.create(dto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar inventario del tenant' })
  findAll(@Request() req) {
    return this.inventoryService.findAll(req.user.tenantId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Listar ítems con bajo stock' })
  findLowStock(@Request() req) {
    return this.inventoryService.findLowStock(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ítem por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.inventoryService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Actualizar stock u otros datos (Admin/Technician)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
    @Request() req,
  ) {
    return this.inventoryService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar ítem (Solo Admin)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.inventoryService.remove(id, req.user.tenantId);
  }
}
