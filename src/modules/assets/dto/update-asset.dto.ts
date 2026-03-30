// update-asset.dto.ts
// Campos editables de un equipo. Todos opcionales.

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateAssetDto {
  @ApiProperty({ example: 'Camara Frio #3 (reparada)', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'refrigerador', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 'Daikin', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'CoolMaster 5000', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'SN-789012', required: false })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ example: 'NFC-XYZ-002', required: false })
  @IsOptional()
  @IsString()
  nfcTagId?: string;

  @ApiProperty({ example: 'Bodega principal', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: -33.45, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -70.67, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: false, description: 'Dar de baja el equipo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
