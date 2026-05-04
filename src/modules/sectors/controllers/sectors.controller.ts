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
import { SectorsService } from '../services/sectors.service';
import { CreateSectorDto, UpdateSectorDto } from '../dto/sector.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/http/guards/roles.guard';
import { TenantGuard } from '../../auth/infrastructure/http/guards/tenant.guard';
import { Roles } from '../../auth/infrastructure/http/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sectors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear sector (Solo Admin)' })
  create(@Body() dto: CreateSectorDto, @Request() req) {
    return this.sectorsService.create(dto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar sectores del tenant' })
  findAll(@Request() req) {
    return this.sectorsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sector por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.sectorsService.findById(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar sector (Solo Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateSectorDto) {
    return this.sectorsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar sector (Solo Admin)' })
  remove(@Param('id') id: string) {
    return this.sectorsService.remove(id);
  }
}
