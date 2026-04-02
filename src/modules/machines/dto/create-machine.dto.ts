// create-machine.dto.ts
// Datos para registrar una máquina nueva.

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateMachineDto {
  @ApiProperty({
    example: 'Camara Frio #3',
    description: 'Nombre de la máquina',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'camara',
    description: 'Tipo: camara, refrigerador, vitrina, etc.',
  })
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  @IsString()
  type: string;

  @ApiProperty({
    example: 'Carrier',
    description: 'Marca de la máquina',
    required: false,
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    example: 'X-Cool 3000',
    description: 'Modelo de la máquina',
    required: false,
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    example: 'SN-123456',
    description: 'Número de serie',
    required: false,
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({
    example: 'NFC-ABC-001',
    description: 'ID del tag NFC físico',
    required: false,
  })
  @IsOptional()
  @IsString()
  nfcTagId?: string;

  @ApiProperty({
    example: 'Bodega 2, pasillo 3',
    description: 'Ubicación de la máquina',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: -33.4489,
    description: 'Latitud GPS de referencia',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    example: -70.6693,
    description: 'Longitud GPS de referencia',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
