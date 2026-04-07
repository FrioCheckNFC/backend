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
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { MachinesService } from './machines.service';
import { CreateMachineDto, UpdateMachineDto } from './dto/machine.dto';
import { ScanMachineDto } from './dto/scan-machine.dto';
import { MachineStatus } from './entities/machine.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@Controller('machines')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMachineDto: CreateMachineDto, @CurrentTenant() tenantId: string) {
    return this.machinesService.create(createMachineDto, tenantId);
  }

  @Post('scan')
  @RequireRoles('ADMIN', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @HttpCode(HttpStatus.OK)
  async scan(@Body() scanMachineDto: ScanMachineDto, @CurrentTenant() tenantId: string) {
    try {
      return await this.machinesService.scan(scanMachineDto, tenantId);
    } catch (err) {
      Logger.error({ msg: 'Error in machines.scan', scanMachineDto, tenantId, err });
      throw new InternalServerErrorException('Error scanning NFC tag');
    }
  }

  @Get()
  @RequireRoles('ADMIN', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: MachineStatus,
  ) {
    return this.machinesService.findAll(tenantId, status);
  }

  @Get(':id/nfc-tag')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'VENDOR', 'DRIVER', 'RETAILER')
  async getNfcTag(@Param('id') machineId: string, @CurrentTenant() tenantId: string) {
    try {
      return await this.machinesService.findById(machineId, tenantId);
    } catch (err) {
      Logger.error({ msg: 'Error en getNfcTag', machineId, tenantId, err });
      throw new InternalServerErrorException('Error retrieving NFC tag for machine');
    }
  }

  @Get(':id')
  @RequireRoles('ADMIN', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  findById(@Param('id') id: string) {
    return this.machinesService.findById(id);
  }

  @Get('serial/:serialNumber')
  @RequireRoles('ADMIN', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  findBySerialNumber(
    @Param('serialNumber') serialNumber: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.machinesService.findBySerialNumber(serialNumber, tenantId);
  }

  @Patch(':id')
  @RequireRoles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateMachineDto: UpdateMachineDto,
  ) {
    return this.machinesService.update(id, updateMachineDto);
  }

  @Delete(':id')
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.machinesService.remove(id);
  }
}
