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
import { VisitsService } from './visits.service';
import { CheckInVisitDto, CheckOutVisitDto } from './dto/visit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';

@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post('check-in')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER')
  @HttpCode(HttpStatus.CREATED)
  checkIn(@Body() checkInVisitDto: CheckInVisitDto) {
    return this.visitsService.checkIn(checkInVisitDto);
  }

  @Post(':id/check-out')
  @RequireRoles('ADMIN', 'TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER')
  @HttpCode(HttpStatus.OK)
  checkOut(
    @Param('id') visitId: string,
    @Body() checkOutVisitDto: CheckOutVisitDto,
  ) {
    // Override visitId desde la ruta
    checkOutVisitDto.visitId = visitId;
    return this.visitsService.checkOut(checkOutVisitDto);
  }

  @Get(':id')
  @RequireRoles('TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER', 'ADMIN')
  findById(@Param('id') id: string) {
    return this.visitsService.findById(id);
  }

  @Get('user/:userId')
  @RequireRoles('TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER', 'ADMIN')
  findByUser(
    @Param('userId') userId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.visitsService.findByUser(userId, tenantId);
  }

  @Get('open')
  @RequireRoles('TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER', 'ADMIN')
  findOpenVisits(@Query('tenantId') tenantId: string) {
    return this.visitsService.findOpenVisits(tenantId);
  }
}
