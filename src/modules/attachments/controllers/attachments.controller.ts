import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AttachmentsService } from '../services/attachments.service';
import { CreateAttachmentDto } from '../dto/attachment.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/http/guards/roles.guard';
import { TenantGuard } from '../../auth/infrastructure/http/guards/tenant.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo archivo adjunto' })
  create(@Body() createAttachmentDto: CreateAttachmentDto, @Request() req) {
    return this.attachmentsService.create(createAttachmentDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los adjuntos del tenant' })
  findAll(@Request() req) {
    return this.attachmentsService.findAll(req.user.tenantId);
  }

  @Get('work-order/:orderId')
  @ApiOperation({ summary: 'Listar adjuntos por orden de trabajo' })
  findByWorkOrder(@Param('orderId') orderId: string, @Request() req) {
    return this.attachmentsService.findByWorkOrder(orderId, req.user.tenantId);
  }

  @Get('visit/:visitId')
  @ApiOperation({ summary: 'Listar adjuntos por visita' })
  findByVisit(@Param('visitId') visitId: string, @Request() req) {
    return this.attachmentsService.findByVisit(visitId, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener adjunto por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.attachmentsService.findById(id, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar adjunto' })
  remove(@Param('id') id: string, @Request() req) {
    return this.attachmentsService.remove(id, req.user.tenantId);
  }
}
