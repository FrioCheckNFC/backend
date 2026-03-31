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
import { MermasService } from './mermas.service';
import { CreateMermaDto, UpdateMermaDto } from './dto/merma.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@Controller('mermas')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class MermasController {
  constructor(private readonly mermasService: MermasService) {}

  @Post()
  @RequireRoles('ADMIN', 'TECHNICIAN', 'VENDOR', 'RETAILER')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMermaDto: CreateMermaDto) {
    return this.mermasService.create(createMermaDto);
  }

  @Get()
  @RequireRoles('ADMIN', 'VENDOR')
  findAll(@CurrentTenant() tenantId: string) {
    return this.mermasService.findAll(tenantId);
  }

  @Get('stats')
  @RequireRoles('ADMIN')
  getStats(@CurrentTenant() tenantId: string) {
    return this.mermasService.getStats(tenantId);
  }

  @Get('stats/by-product')
  @RequireRoles('ADMIN')
  getStatsByProduct(@CurrentTenant() tenantId: string) {
    return this.mermasService.getStatsByProduct(tenantId);
  }

  @Get(':id')
  @RequireRoles('ADMIN', 'VENDOR')
  findById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.mermasService.findById(id, tenantId);
  }

  @Patch(':id')
  @RequireRoles('ADMIN')
  update(@Param('id') id: string, @Body() updateMermaDto: UpdateMermaDto) {
    return this.mermasService.update(id, updateMermaDto);
  }

  @Delete(':id')
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.mermasService.remove(id);
  }
}
