import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto, ValidateNfcDto } from './dto/work-order.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @Roles('ADMIN', 'DRIVER')
  create(@Body() createWorkOrderDto: CreateWorkOrderDto, @Req() req) {
    return this.workOrdersService.create(createWorkOrderDto, req.user.id, req.user.tenantId);
  }

  @Get()
  @Roles('ADMIN', 'DRIVER', 'TECHNICIAN', 'VENDOR', 'RETAILER')
  findAll(@Req() req, @Query('status') status?: string) {
    return this.workOrdersService.findAll(req.user.tenantId, status);
  }

  @Get(':id')
  @Roles('ADMIN', 'DRIVER', 'TECHNICIAN', 'VENDOR', 'RETAILER')
  findById(@Param('id') id: string, @Req() req) {
    return this.workOrdersService.findById(id, req.user.tenantId);
  }

  @Post(':id/validate-nfc')
  @Roles('ADMIN', 'DRIVER', 'TECHNICIAN', 'RETAILER')
  validateNfcOnArrival(@Param('id') id: string, @Body() dto: ValidateNfcDto, @Req() req) {
    return this.workOrdersService.validateNfcOnArrival(id, dto.actualNfcUid, req.user.tenantId);
  }

  @Post(':id/complete')
  @Roles('ADMIN', 'DRIVER', 'TECHNICIAN')
  completeWorkOrder(@Param('id') id: string, @Req() req) {
    return this.workOrdersService.completeWorkOrder(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DRIVER')
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrderDto, @Req() req) {
    return this.workOrdersService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @Req() req) {
    return this.workOrdersService.remove(id, req.user.tenantId);
  }
}
