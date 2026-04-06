import { IsString, IsNumber, IsOptional, IsISO8601, Min, Max } from 'class-validator';

export class ScanMachineDto {
  @IsString()
  nfcTagId: string; // Identificador del tag (campo sid del payload NDEF)

  @IsString()
  nfcUid: string; // UID inmutable del chip (ej: 04:A3:B2:C1:D0:E9:F8)

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
  gpsAccuracy?: number; // Precisión en metros

  @IsISO8601()
  scannedAt: string; // ISO8601 timestamp
}
