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

import { FindAllMachinesUseCase } from '../../../application/use-cases/find-all-machines.use-case';
import { FindMachineUseCase } from '../../../application/use-cases/find-machine.use-case';
import { FindMachineByNfcUseCase } from '../../../application/use-cases/find-machine-by-nfc.use-case';
import { CreateMachineUseCase } from '../../../application/use-cases/create-machine.use-case';
import { UpdateMachineUseCase } from '../../../application/use-cases/update-machine.use-case';
import { RemoveMachineUseCase } from '../../../application/use-cases/remove-machine.use-case';
import { ScanMachineUseCase } from '../../../application/use-cases/scan-machine.use-case';
import { NfcReadMachineUseCase } from '../../../application/use-cases/nfc-read-machine.use-case';

import { CreateMachineDto } from '../dto/create-machine.dto';
import { UpdateMachineDto } from '../dto/update-machine.dto';
import { ScanMachineDto } from '../dto/scan-machine.dto';
import { NfcReadDto } from '../dto/nfc-read.dto';

import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../auth/infrastructure/http/guards/tenant.guard';
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../auth/infrastructure/http/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Machines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('machines')
export class MachinesController {
  constructor(
    private readonly findAllUseCase: FindAllMachinesUseCase,
    private readonly findOneUseCase: FindMachineUseCase,
    private readonly findByNfcUseCase: FindMachineByNfcUseCase,
    private readonly createUseCase: CreateMachineUseCase,
    private readonly updateUseCase: UpdateMachineUseCase,
    private readonly removeUseCase: RemoveMachineUseCase,
    private readonly scanUseCase: ScanMachineUseCase,
    private readonly nfcReadUseCase: NfcReadMachineUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las máquinas del tenant' })
  findAll(@Req() req: any) {
    return this.findAllUseCase.execute(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una máquina por ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.findOneUseCase.execute(id, req.user.tenantId);
  }

  @Get('nfc/:nfcId')
  @ApiOperation({ summary: 'Buscar máquina por ID de Tag NFC' })
  findByNfc(@Param('nfcId') nfcId: string, @Req() req: any) {
    return this.findByNfcUseCase.execute(nfcId, req.user.tenantId);
  }

  @Post()
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Crear una nueva máquina' })
  create(@Body() createMachineDto: CreateMachineDto, @Req() req: any) {
    return this.createUseCase.execute(createMachineDto, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  @ApiOperation({ summary: 'Actualizar una máquina' })
  update(
    @Param('id') id: string,
    @Body() updateMachineDto: UpdateMachineDto,
    @Req() req: any,
  ) {
    return this.updateUseCase.execute(id, updateMachineDto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una máquina (Soft Delete)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.removeUseCase.execute(id, req.user.tenantId);
  }

  @Post('scan')
  @ApiOperation({ summary: 'Validar proximidad NFC + Geofencing' })
  scan(@Body() scanDto: ScanMachineDto, @Req() req: any) {
    return this.scanUseCase.execute(scanDto, req.user.tenantId);
  }

  @Post('nfc-read')
  @ApiOperation({ 
    summary: 'Lectura NFC Integral', 
    description: 'Valida NFC, GPS y retorna estado de máquina, últimas visitas y acciones permitidas' 
  })
  nfcRead(@Body() nfcReadDto: NfcReadDto, @Req() req: any) {
    return this.nfcReadUseCase.execute(
      nfcReadDto, 
      req.user.tenantId,
      req.user.roles
    );
  }
}
