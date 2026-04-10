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
import { StoresService } from '../services/stores.service';
import { CreateStoreDto, UpdateStoreDto } from '../dto/store.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo local' })
  create(@Body() createStoreDto: CreateStoreDto, @Request() req) {
    return this.storesService.create(createStoreDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar locales del tenant' })
  findAll(@Request() req) {
    return this.storesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener local por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.storesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar local' })
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Request() req,
  ) {
    return this.storesService.update(id, updateStoreDto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar local' })
  remove(@Param('id') id: string, @Request() req) {
    return this.storesService.remove(id, req.user.tenantId);
  }
}
