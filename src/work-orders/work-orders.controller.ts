import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from './dto/work-order.dto';
import { WorkOrderStatus } from './entities/work-order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @RequireRoles('ADMIN_TENANT', 'TRANSPORTISTA')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWorkOrderDto: CreateWorkOrderDto) {
    return this.workOrdersService.create(createWorkOrderDto);
  }

  @Get()
  @RequireRoles('ADMIN_TENANT', 'TRANSPORTISTA', 'TECNICO', 'VENDEDOR', 'MINORISTA')
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('status') status?: WorkOrderStatus,
  ) {
    return this.workOrdersService.findAll(tenantId, status);
  }

  @Get(':id')
  @RequireRoles('ADMIN_TENANT', 'TRANSPORTISTA', 'TECNICO', 'VENDEDOR', 'MINORISTA')
  findById(@Param('id') id: string) {
    return this.workOrdersService.findById(id);
  }

  @Post(':id/validate-nfc')
  @RequireRoles('TRANSPORTISTA', 'TECNICO', 'MINORISTA')
  @HttpCode(HttpStatus.OK)
  validateNfcOnArrival(
    @Param('id') workOrderId: string,
    @Body() body: { actualNfcUid: string },
  ) {
    return this.workOrdersService.validateNfcOnArrival(
      workOrderId,
      body.actualNfcUid,
    );
  }

  @Post(':id/deliver')
  @RequireRoles('TRANSPORTISTA', 'TECNICO', 'MINORISTA')
  @HttpCode(HttpStatus.OK)
  markAsDelivered(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.markAsDelivered(id, updateDto);
  }

  @Patch(':id')
  @RequireRoles('ADMIN_TENANT', 'TRANSPORTISTA')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(id, updateDto);
  }
}
