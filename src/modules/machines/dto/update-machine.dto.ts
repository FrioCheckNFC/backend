// update-machine.dto.ts
// Campos editables de una máquina. Todos opcionales.

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateMachineDto {
  @ApiProperty({ example: 'Camara Frio #3 (reparada)', required: false })
  @IsOptional()
  @IsString()
  name?: string;



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

  @ApiProperty({ 
    example: 'MAINTENANCE', 
    description: 'ACTIVE, MAINTENANCE, OUT_OF_SERVICE',
    required: false 
  })
  @IsOptional()
  @IsString()
  status?: string;

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

  @ApiProperty({
    example: false,
    description: 'Dar de baja la máquina',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
