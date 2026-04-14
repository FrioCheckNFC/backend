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
  Req,
} from '@nestjs/common';
import { MachinesService } from '../services/machines.service';
import { CreateMachineDto } from '../dto/create-machine.dto';
import { UpdateMachineDto } from '../dto/update-machine.dto';
import { ScanMachineDto } from '../dto/scan-machine.dto';
import { NfcReadDto } from '../dto/nfc-read.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Machines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las máquinas del tenant' })
  findAll(@Req() req: any) {
    return this.machinesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una máquina por ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.machinesService.findOne(id, req.user.tenantId);
  }

  @Get('nfc/:nfcId')
  @ApiOperation({ summary: 'Buscar máquina por ID de Tag NFC' })
  findByNfc(@Param('nfcId') nfcId: string, @Req() req: any) {
    return this.machinesService.findByNfc(nfcId, req.user.tenantId);
  }

  @Post()
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Crear una nueva máquina' })
  create(@Body() createMachineDto: CreateMachineDto, @Req() req: any) {
    return this.machinesService.create(createMachineDto, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Actualizar una máquina' })
  update(
    @Param('id') id: string,
    @Body() updateMachineDto: UpdateMachineDto,
    @Req() req: any,
  ) {
    return this.machinesService.update(id, updateMachineDto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una máquina (Soft Delete)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.machinesService.remove(id, req.user.tenantId);
  }

  @Post('scan')
  @ApiOperation({ summary: 'Validar proximidad NFC + Geofencing' })
  scan(@Body() scanDto: ScanMachineDto, @Req() req: any) {
    return this.machinesService.scan(scanDto, req.user.tenantId);
  }

  @Post('nfc-read')
  @ApiOperation({ 
    summary: 'Lectura NFC Integral', 
    description: 'Valida NFC, GPS y retorna estado de máquina, últimas visitas y acciones permitidas' 
  })
  nfcRead(@Body() nfcReadDto: NfcReadDto, @Req() req: any) {
    return this.machinesService.nfcRead(
      nfcReadDto, 
      req.user.tenantId,
      req.user.roles
    );
  }
}
