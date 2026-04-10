import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { NfcTagsService } from '../services/nfc-tags.service';
import { CreateNfcTagDto } from '../dto/nfc-tag.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('NFC Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('nfc-tags')
export class NfcTagsController {
  constructor(private readonly nfcTagsService: NfcTagsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Registrar un nuevo tag NFC' })
  create(@Body() createNfcTagDto: CreateNfcTagDto) {
    return this.nfcTagsService.create(createNfcTagDto);
  }

  @Get('uid/:uid')
  @ApiOperation({ summary: 'Obtener tag por UID' })
  findByUid(@Param('uid') uid: string, @CurrentUser() user: any) {
    return this.nfcTagsService.findByUid(uid, user.tenantId);
  }

  @Get('machine/:machineId')
  @ApiOperation({ summary: 'Obtener tag por ID de máquina' })
  findByMachine(@Param('machineId') machineId: string, @CurrentUser() user: any) {
    return this.nfcTagsService.findByMachineId(machineId, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tags del tenant' })
  findAll(@CurrentUser() user: any, @Query('isActive') isActive?: boolean) {
    return this.nfcTagsService.findAll(user.tenantId, isActive);
  }

  @Patch('lock/:uid')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Bloquear tag permanentemente' })
  lockTag(@Param('uid') uid: string, @CurrentUser() user: any) {
    return this.nfcTagsService.lockTag(uid, user.tenantId);
  }

  @Patch('deactivate/:uid')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desactivar tag' })
  deactivateTag(@Param('uid') uid: string, @CurrentUser() user: any) {
    return this.nfcTagsService.deactivateTag(uid, user.tenantId);
  }
}
