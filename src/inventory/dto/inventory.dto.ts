import { IsString, IsUUID, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { InventoryStatus } from '../entities/inventory.entity';

export class CreateInventoryDto {
  @IsUUID()
  tenantId: string;

  @IsString()
  partName: string;

  @IsOptional()
  @IsString()
  partNumber?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  partName?: string;

  @IsOptional()
  @IsString()
  partNumber?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @IsOptional()
  @IsString()
  location?: string;
}
