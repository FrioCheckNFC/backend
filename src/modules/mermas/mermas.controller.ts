import {
  Controller, Post, Get, Patch, Delete,
  Param, Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MermasService } from './mermas.service';
import { CreateMermaDto, UpdateMermaDto } from './dto/merma.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Mermas')
@ApiBearerAuth()
@Controller('mermas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MermasController {
  constructor(private readonly mermasService: MermasService) {}

  @Post()
  @Roles('ADMIN', 'TECHNICIAN', 'VENDOR', 'RETAILER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una merma' })
  create(@Body() dto: CreateMermaDto, @Req() req) {
    return this.mermasService.create(dto, req.user.tenantId);
  }

  @Get()
  @Roles('ADMIN', 'VENDOR')
  @ApiOperation({ summary: 'Listar mermas del tenant' })
  findAll(@Req() req) {
    return this.mermasService.findAll(req.user.tenantId);
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Estadísticas totales de merma' })
  getStats(@Req() req) {
    return this.mermasService.getStats(req.user.tenantId);
  }

  @Get('stats/by-product')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Estadísticas de merma agrupadas por producto' })
  getStatsByProduct(@Req() req) {
    return this.mermasService.getStatsByProduct(req.user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'VENDOR')
  @ApiOperation({ summary: 'Obtener una merma por ID' })
  findById(@Param('id') id: string, @Req() req) {
    return this.mermasService.findById(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una merma' })
  update(@Param('id') id: string, @Body() dto: UpdateMermaDto) {
    return this.mermasService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una merma (soft delete)' })
  remove(@Param('id') id: string) {
    return this.mermasService.remove(id);
  }
}
