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
import { MermasService } from '../services/mermas.service';
import { CreateMermaDto, UpdateMermaDto } from '../dto/merma.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/http/guards/roles.guard';
import { TenantGuard } from '../../auth/infrastructure/http/guards/tenant.guard';
import { Roles } from '../../auth/infrastructure/http/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Mermas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('mermas')
export class MermasController {
  constructor(private readonly mermasService: MermasService) {}

  @Post()
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Reportar una nueva merma' })
  create(@Body() createMermaDto: CreateMermaDto, @Request() req) {
    return this.mermasService.create(createMermaDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las mermas del tenant' })
  findAll(@Request() req) {
    return this.mermasService.findAll(req.user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas globales de mermas' })
  getStats(@Request() req) {
    return this.mermasService.getStats(req.user.tenantId);
  }

  @Get('stats/by-product')
  @ApiOperation({ summary: 'Obtener estadísticas agrupadas por producto' })
  getStatsByProduct(@Request() req) {
    return this.mermasService.getStatsByProduct(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener merma por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.mermasService.findById(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar reporte de merma (Solo Admin)' })
  update(
    @Param('id') id: string,
    @Body() updateMermaDto: UpdateMermaDto,
    @Request() req,
  ) {
    return this.mermasService.update(id, updateMermaDto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar reporte de merma (Solo Admin)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.mermasService.remove(id, req.user.tenantId);
  }
}
