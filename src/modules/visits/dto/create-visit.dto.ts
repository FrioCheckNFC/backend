// create-visit.dto.ts
// Datos que manda la app movil cuando el tecnico registra una visita.
// El technicianId y tenantId se sacan del token JWT (no del body).

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateVisitDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID del equipo visitado' })
  @IsNotEmpty({ message: 'El assetId es obligatorio' })
  @IsUUID()
  assetId: string;

  @ApiProperty({ example: -33.4489, description: 'Latitud GPS del tecnico', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -70.6693, description: 'Longitud GPS del tecnico', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 'NFC-ABC-001', description: 'Tag NFC escaneado', required: false })
  @IsOptional()
  @IsString()
  nfcTagId?: string;

  @ApiProperty({ example: -18.5, description: 'Temperatura registrada (°C)', required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ example: 'Equipo funcionando normal, sin escarcha', description: 'Notas del tecnico', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'completed', description: 'Estado: pending, completed, flagged', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: '2026-03-29T10:30:00Z', description: 'Fecha/hora real de la visita (puede ser offline)' })
  @IsNotEmpty({ message: 'La fecha de visita es obligatoria' })
  @IsDateString()
  visitedAt: string;
}
