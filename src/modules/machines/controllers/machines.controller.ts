// controllers/machines.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MachinesService } from '../services/machines.service';
import { CreateMachineDto } from '../dto/create-machine.dto';
import { UpdateMachineDto } from '../dto/update-machine.dto';
import { ScanMachineDto } from '../dto/scan-machine.dto';
import { NfcReadDto } from '../dto/nfc-read.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Machines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las máquinas del tenant' })
  findAll(@CurrentUser() user: any) {
    return this.machinesService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una máquina por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.machinesService.findOne(id, user.tenantId);
  }

  @Get('nfc/:nfcId')
  @ApiOperation({ summary: 'Buscar máquina por ID de Tag NFC' })
  findByNfc(@Param('nfcId') nfcId: string, @CurrentUser() user: any) {
    return this.machinesService.findByNfc(nfcId, user.tenantId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva máquina' })
  create(@Body() createMachineDto: CreateMachineDto, @CurrentUser() user: any) {
    return this.machinesService.create(createMachineDto, user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una máquina' })
  update(
    @Param('id') id: string,
    @Body() updateMachineDto: UpdateMachineDto,
    @CurrentUser() user: any,
  ) {
    return this.machinesService.update(id, updateMachineDto, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una máquina (Soft Delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.machinesService.remove(id, user.tenantId);
  }

  @Post('scan')
  @ApiOperation({ summary: 'Validar proximidad NFC + Geofencing' })
  scan(@Body() scanDto: ScanMachineDto, @CurrentUser() user: any) {
    return this.machinesService.scan(scanDto, user.tenantId);
  }

  @Post('nfc-read')
  @ApiOperation({ 
    summary: 'Lectura NFC Integral', 
    description: 'Valida NFC, GPS y retorna estado de máquina, últimas visitas y acciones permitidas' 
  })
  nfcRead(@Body() nfcReadDto: NfcReadDto, @CurrentUser() user: any) {
    return this.machinesService.nfcRead(
      nfcReadDto, 
      user.tenantId,
      user.roles
    );
  }
}
