import { IsString, IsUUID, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMermaDto {
  @IsUUID()
  reportedById: string;

  @IsOptional()
  @IsUUID()
  ticketId?: string;

  @IsOptional()
  @IsUUID()
  machineId?: string;

  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitCost: number;

  @IsOptional()
  @IsString()
  cause?: string;

  @Type(() => Date)
  @IsDate()
  mermaDate: Date;
}

export class UpdateMermaDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsString()
  cause?: string;
}
