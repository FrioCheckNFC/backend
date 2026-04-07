import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NfcTagsService } from './nfc-tags.service';
import { CreateNfcTagDto } from './dto/nfc-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@ApiTags('NFC Tags')
@Controller('nfc-tags')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class NfcTagsController {
  constructor(private readonly nfcTagsService: NfcTagsService) {}

  @Post()
  @RequireRoles('ADMIN', 'TECHNICIAN')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNfcTagDto: CreateNfcTagDto, @CurrentTenant() tenantId: string) {
    createNfcTagDto.tenantId = tenantId;
    return this.nfcTagsService.create(createNfcTagDto);
  }

  @Get()
  @RequireRoles('ADMIN', 'TECHNICIAN', 'VENDOR', 'DRIVER', 'RETAILER')
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive ? isActive === 'true' : undefined;
    return this.nfcTagsService.findAll(tenantId, active);
  }

  @Get('machine/:machineId')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'VENDOR', 'DRIVER', 'RETAILER')
  findByMachineId(
    @Param('machineId') machineId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.nfcTagsService.findByMachineId(machineId, tenantId);
  }

  @Get(':uid')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'VENDOR', 'DRIVER', 'RETAILER')
  findByUid(
    @Param('uid') uid: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.nfcTagsService.findByUid(uid, tenantId);
  }

  @Post(':uid/validate-integrity')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'VENDOR', 'DRIVER', 'RETAILER')
  @HttpCode(HttpStatus.OK)
  validateIntegrity(
    @Param('uid') uid: string,
    @Body() body: { checksum: string },
    @CurrentTenant() tenantId: string,
  ) {
    return this.nfcTagsService.validateIntegrity(uid, body.checksum, tenantId);
  }

  @Post(':uid/lock')
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.OK)
  lockTag(@Param('uid') uid: string, @CurrentTenant() tenantId: string) {
    return this.nfcTagsService.lockTag(uid, tenantId);
  }

  @Post(':uid/deactivate')
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.OK)
  deactivateTag(@Param('uid') uid: string, @CurrentTenant() tenantId: string) {
    return this.nfcTagsService.deactivateTag(uid, tenantId);
  }
}
