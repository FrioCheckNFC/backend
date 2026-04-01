import {
  Controller, Post, Get, Patch, Delete,
  Param, Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles('ADMIN', 'TECHNICIAN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar item al inventario' })
  create(@Body() dto: CreateInventoryDto, @Req() req) {
    return this.inventoryService.create(dto, req.user.tenantId);
  }

  @Get()
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Listar inventario del tenant' })
  findAll(@Req() req) {
    return this.inventoryService.findAll(req.user.tenantId);
  }

  @Get('low-stock')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Listar items con stock bajo' })
  findLowStock(@Req() req) {
    return this.inventoryService.findLowStock(req.user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Obtener un item por ID' })
  findById(@Param('id') id: string, @Req() req) {
    return this.inventoryService.findById(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Actualizar un item del inventario' })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un item (soft delete)' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
