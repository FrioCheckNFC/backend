import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class NfcReadDto {
  @ApiProperty({
    description: 'NFC ID del tag leído (uuid)',
    example: 'eda94cc6-2f1b-465c-8881-6d479c2ab452',
  })
  @IsString()
  nfcId: string;

  @ApiProperty({
    description: 'Código NFC del tag',
    example: 'NFC-68212T',
    required: false,
  })
  @IsString()
  @IsOptional()
  nfcCode?: string;

  @ApiProperty({
    description: 'Latitud actual del dispositivo móvil',
    example: -33.4489,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'Longitud actual del dispositivo móvil',
    example: -70.6693,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
