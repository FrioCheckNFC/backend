import { IsString, IsNumber, IsOptional, IsISO8601, Min, Max } from 'class-validator';

export class ScanMachineDto {
  @IsString()
  nfcTagId: string; // Identificador del tag/serial

  @IsString()
  nfcUid: string; // UID inmutable del chip

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsNumber()
  gpsAccuracy?: number;

  @IsOptional()
  @IsISO8601()
  scannedAt?: string;
}
