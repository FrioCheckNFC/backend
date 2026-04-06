import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@Controller('attachments')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @RequireRoles('ADMIN', 'TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAttachmentDto: CreateAttachmentDto) {
    return this.attachmentsService.create(createAttachmentDto);
  }

  // Specific routes BEFORE generic :id
  @Get('visit/:visitId')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER')
  findByVisit(
    @Param('visitId') visitId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.attachmentsService.findByVisit(visitId, tenantId);
  }

  @Get('work-order/:workOrderId')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER')
  findByWorkOrder(
    @Param('workOrderId') workOrderId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.attachmentsService.findByWorkOrder(workOrderId, tenantId);
  }

  @Get('ticket/:ticketId')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER')
  findByTicket(
    @Param('ticketId') ticketId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.attachmentsService.findByTicket(ticketId, tenantId);
  }

  @Get(':id')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER')
  findById(@Param('id') id: string) {
    return this.attachmentsService.findById(id);
  }

  @Delete(':id')
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.attachmentsService.delete(id);
  }

  @Post('validate-type')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER')
  @HttpCode(HttpStatus.OK)
  validateMimeType(
    @Body() body: { mimeType: string },
  ) {
    return {
      isValid: this.attachmentsService.isValidMimeType(body.mimeType),
    };
  }
}
