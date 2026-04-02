// update-visit.dto.ts
// FIX #10: status ahora valida solo valores permitidos con @IsIn

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

export class UpdateVisitDto {
  @ApiProperty({
    example: -20.3,
    description: 'Corregir temperatura',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({
    example: 'Se detecto escarcha en el evaporador',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: 'flagged',
    description: 'Cambiar estado: pending, completed, flagged',
    required: false,
    enum: ['pending', 'completed', 'flagged'],
  })
  @IsOptional()
  @IsIn(['pending', 'completed', 'flagged'], {
    message: 'Estado invalido. Valores permitidos: pending, completed, flagged',
  })
  status?: string;
}
