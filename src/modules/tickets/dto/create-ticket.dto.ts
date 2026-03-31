// create-ticket.dto.ts
// FIX #10: priority ahora valida solo valores permitidos con @IsIn

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Temperatura fuera de rango en Camara #3' })
  @IsNotEmpty({ message: 'El titulo es obligatorio' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'La camara marca -5°C cuando deberia estar a -18°C',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del equipo (opcional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'UUID del tecnico asignado (opcional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({
    example: 'high',
    description: 'Prioridad: low, medium, high, urgent',
    required: false,
    enum: ['low', 'medium', 'high', 'urgent'],
  })
  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'], {
    message: 'Prioridad invalida. Valores permitidos: low, medium, high, urgent',
  })
  priority?: string;
}
