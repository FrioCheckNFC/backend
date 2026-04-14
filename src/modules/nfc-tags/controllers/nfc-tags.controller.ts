// controllers/nfc-tags.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { NfcTagsService } from '../services/nfc-tags.service';
import { CreateNfcTagDto } from '../dto/nfc-tag.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('NFC Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('nfc-tags')
export class NfcTagsController {
  constructor(private readonly nfcTagsService: NfcTagsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo tag NFC' })
  create(@Body() createNfcTagDto: CreateNfcTagDto) {
    return this.nfcTagsService.create(createNfcTagDto);
  }

  @Get('uid/:uid')
  @ApiOperation({ summary: 'Obtener tag por UID' })
  findByUid(@Param('uid') uid: string, @Query('tenantId') tenantId: string) {
    return this.nfcTagsService.findByUid(uid, tenantId);
  }

  @Get('machine/:machineId')
  @ApiOperation({ summary: 'Obtener tag por ID o serial de máquina' })
  findByMachine(@Param('machineId') machineIdOrSerial: string, @Query('tenantId') tenantId: string) {
    return this.nfcTagsService.findByMachineIdOrSerial(machineIdOrSerial, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tags del tenant' })
  findAll(@Query('tenantId') tenantId: string, @Query('isActive') isActive?: boolean) {
    return this.nfcTagsService.findAll(tenantId, isActive);
  }

  @Patch('lock/:uid')
  @ApiOperation({ summary: 'Bloquear tag permanentemente' })
  lockTag(@Param('uid') uid: string, @Query('tenantId') tenantId: string) {
    return this.nfcTagsService.lockTag(uid, tenantId);
  }

  @Patch('deactivate/:uid')
  @ApiOperation({ summary: 'Desactivar tag' })
  deactivateTag(@Param('uid') uid: string, @Query('tenantId') tenantId: string) {
    return this.nfcTagsService.deactivateTag(uid, tenantId);
  }
}
