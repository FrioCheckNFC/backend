import {
  Controller, Post, Get, Patch, Delete,
  Param, Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SectorsService } from './sectors.service';
import { CreateSectorDto, UpdateSectorDto } from './dto/sector.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Sectors')
@ApiBearerAuth()
@Controller('sectors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un sector' })
  create(@Body() dto: CreateSectorDto, @Req() req) {
    return this.sectorsService.create(dto, req.user.tenantId);
  }

  @Get()
  @Roles('ADMIN', 'VENDOR', 'SUPPORT')
  @ApiOperation({ summary: 'Listar sectores del tenant' })
  findAll(@Req() req) {
    return this.sectorsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'VENDOR', 'SUPPORT')
  @ApiOperation({ summary: 'Obtener un sector por ID' })
  findById(@Param('id') id: string, @Req() req) {
    return this.sectorsService.findById(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un sector' })
  update(@Param('id') id: string, @Body() dto: UpdateSectorDto) {
    return this.sectorsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un sector (soft delete)' })
  remove(@Param('id') id: string) {
    return this.sectorsService.remove(id);
  }
}
