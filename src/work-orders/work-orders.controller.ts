import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
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
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @RequireRoles('ADMIN', 'DRIVER')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWorkOrderDto: CreateWorkOrderDto) {
    return this.workOrdersService.create(createWorkOrderDto);
  }

  @Get()
  @RequireRoles('ADMIN', 'DRIVER', 'TECHNICIAN', 'VENDOR', 'RETAILER')
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: WorkOrderStatus,
  ) {
    return this.workOrdersService.findAll(tenantId, status);
  }

  @Get(':id')
  @RequireRoles('ADMIN', 'DRIVER', 'TECHNICIAN', 'VENDOR', 'RETAILER')
  findById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.workOrdersService.findById(id, tenantId);
  }

  @Post(':id/validate-nfc')
  @RequireRoles('ADMIN', 'DRIVER', 'TECHNICIAN', 'RETAILER')
  @HttpCode(HttpStatus.OK)
  validateNfcOnArrival(
    @Param('id') workOrderId: string,
    @Body() body: { actualNfcUid: string },
    @CurrentTenant() tenantId: string,
  ) {
    return this.workOrdersService.validateNfcOnArrival(
      workOrderId,
      body.actualNfcUid,
      tenantId,
    );
  }

  @Post(':id/deliver')
  @RequireRoles('ADMIN', 'DRIVER', 'TECHNICIAN', 'RETAILER')
  @HttpCode(HttpStatus.OK)
  markAsDelivered(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkOrderDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.workOrdersService.markAsDelivered(id, updateDto, tenantId);
  }

  @Patch(':id')
  @RequireRoles('ADMIN', 'DRIVER')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(id, updateDto);
  }

  @Delete(':id')
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.workOrdersService.delete(id);
  }
}
