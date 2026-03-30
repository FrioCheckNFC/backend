// create-asset.dto.ts
// Datos para registrar un equipo de refrigeracion nuevo.

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAssetDto {
  @ApiProperty({ example: 'Camara Frio #3', description: 'Nombre del equipo' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'camara', description: 'Tipo: camara, refrigerador, vitrina, etc.' })
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Carrier', description: 'Marca del equipo', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'X-Cool 3000', description: 'Modelo del equipo', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'SN-123456', description: 'Numero de serie', required: false })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ example: 'NFC-ABC-001', description: 'ID del tag NFC fisico', required: false })
  @IsOptional()
  @IsString()
  nfcTagId?: string;

  @ApiProperty({ example: 'Bodega 2, pasillo 3', description: 'Ubicacion del equipo', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: -33.4489, description: 'Latitud GPS de referencia', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -70.6693, description: 'Longitud GPS de referencia', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
