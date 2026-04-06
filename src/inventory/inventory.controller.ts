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
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @RequireRoles('ADMIN', 'TECHNICIAN')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @RequireRoles('ADMIN', 'TECHNICIAN')
  findAll(@CurrentTenant() tenantId: string) {
    return this.inventoryService.findAll(tenantId);
  }

  @Get('low-stock')
  @RequireRoles('ADMIN', 'TECHNICIAN')
  findLowStock(@CurrentTenant() tenantId: string) {
    return this.inventoryService.findLowStock(tenantId);
  }

  @Get(':id')
  @RequireRoles('ADMIN', 'TECHNICIAN')
  findById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.inventoryService.findById(id, tenantId);
  }

  @Patch(':id')
  @RequireRoles('ADMIN', 'TECHNICIAN')
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
