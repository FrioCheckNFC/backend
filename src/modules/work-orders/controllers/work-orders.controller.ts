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
  Query,
} from '@nestjs/common';
import { WorkOrdersService } from '../services/work-orders.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '../dto/work-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('WorkOrders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una orden de trabajo (Solo Admin)' })
  create(@Body() dto: CreateWorkOrderDto, @Request() req) {
    return this.workOrdersService.create(dto, req.user.id, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar órdenes de trabajo del tenant' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado' })
  findAll(@Request() req, @Query('status') status?: string) {
    return this.workOrdersService.findAll(req.user.tenantId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener orden de trabajo por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.workOrdersService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar orden de trabajo (Solo Admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Request() req,
  ) {
    return this.workOrdersService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar orden de trabajo (Solo Admin)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.workOrdersService.remove(id, req.user.tenantId);
  }

  @Post(':id/validate-nfc')
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Validar llegada a máquina mediante NFC' })
  validateNfc(
    @Param('id') id: string,
    @Body('nfcUid') nfcUid: string,
    @Request() req,
  ) {
    return this.workOrdersService.validateNfcOnArrival(id, nfcUid, req.user.tenantId);
  }

  @Post(':id/complete')
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Marcar orden de trabajo como completada' })
  complete(@Param('id') id: string, @Request() req) {
    return this.workOrdersService.completeWorkOrder(id, req.user.tenantId);
  }
}
