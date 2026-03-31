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
import { SectorsService } from './sectors.service';
import { CreateSectorDto, UpdateSectorDto } from './dto/sector.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@Controller('sectors')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Post()
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorsService.create(createSectorDto);
  }

  @Get()
  @RequireRoles('ADMIN', 'VENDOR', 'SUPPORT')
  findAll(@CurrentTenant() tenantId: string) {
    return this.sectorsService.findAll(tenantId);
  }

  @Get(':id')
  @RequireRoles('ADMIN', 'VENDOR', 'SUPPORT')
  findById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.sectorsService.findById(id, tenantId);
  }

  @Patch(':id')
  @RequireRoles('ADMIN')
  update(@Param('id') id: string, @Body() updateSectorDto: UpdateSectorDto) {
    return this.sectorsService.update(id, updateSectorDto);
  }

  @Delete(':id')
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.sectorsService.remove(id);
  }
}
