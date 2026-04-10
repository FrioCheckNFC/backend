import { IsString, IsOptional, IsUUID, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ description: 'Nombre del local' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Dirección del local', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'ID del sector al que pertenece', required: false })
  @IsUUID()
  @IsOptional()
  sectorId?: string;

  @ApiProperty({ description: 'ID del usuario minorista (Retailer)', required: false })
  @IsUUID()
  @IsOptional()
  retailerId?: string;

  @ApiProperty({ description: 'Latitud', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: 'Longitud', required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class UpdateStoreDto {
  @ApiProperty({ description: 'Nombre del local', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Dirección del local', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'ID del sector al que pertenece', required: false })
  @IsUUID()
  @IsOptional()
  sectorId?: string;

  @ApiProperty({ description: 'ID del usuario minorista (Retailer)', required: false })
  @IsUUID()
  @IsOptional()
  retailerId?: string;

  @ApiProperty({ description: 'Latitud', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: 'Longitud', required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ description: 'Estado del local', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
