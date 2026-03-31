import { IsString, IsUUID, IsOptional, IsNumber, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { KpiType } from '../entities/kpi.entity';

export class CreateKpiDto {
  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  sectorId?: string;

  @IsEnum(KpiType)
  type: KpiType;

  @IsString()
  name: string;

  @IsNumber()
  targetValue: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

export class UpdateKpiDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  currentValue?: number;
}
