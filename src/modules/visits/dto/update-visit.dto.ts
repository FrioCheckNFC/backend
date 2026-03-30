// update-visit.dto.ts
// Campos editables de una visita. Solo para correciones.

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateVisitDto {
  @ApiProperty({ example: -20.3, description: 'Corregir temperatura', required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ example: 'Se detecto escarcha en el evaporador', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'flagged', description: 'Cambiar estado', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
