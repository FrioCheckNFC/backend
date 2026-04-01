import { IsString, IsUUID, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleDto {
  @IsUUID()
  vendorId: string;

  @IsOptional()
  @IsUUID()
  sectorId?: string;

  @IsOptional()
  @IsUUID()
  machineId?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Date)
  @IsDate()
  saleDate: Date;
}

export class UpdateSaleDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  saleDate?: Date;
}
