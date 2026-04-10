import { IsString, IsUUID, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKpiDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  sectorId?: string;

  @IsString()
  type: string;

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
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
