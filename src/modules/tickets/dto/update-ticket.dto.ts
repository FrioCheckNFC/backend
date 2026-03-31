// update-ticket.dto.ts
// FIX #10: priority y status ahora validan solo valores permitidos con @IsIn

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsIn } from 'class-validator';

export class UpdateTicketDto {
  @ApiProperty({ example: 'Titulo actualizado', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Descripcion actualizada', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Reasignar tecnico',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({
    example: 'urgent',
    description: 'Cambiar prioridad: low, medium, high, urgent',
    required: false,
    enum: ['low', 'medium', 'high', 'urgent'],
  })
  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'], {
    message: 'Prioridad invalida. Valores permitidos: low, medium, high, urgent',
  })
  priority?: string;

  @ApiProperty({
    example: 'resolved',
    description: 'Cambiar estado: open, in_progress, resolved, closed',
    required: false,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
  })
  @IsOptional()
  @IsIn(['open', 'in_progress', 'resolved', 'closed'], {
    message: 'Estado invalido. Valores permitidos: open, in_progress, resolved, closed',
  })
  status?: string;
}
