// update-ticket.dto.ts
// Campos editables de un ticket.

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateTicketDto {
  @ApiProperty({ example: 'Titulo actualizado', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Descripcion actualizada', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Reasignar tecnico', required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({ example: 'urgent', description: 'Cambiar prioridad', required: false })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ example: 'resolved', description: 'Cambiar estado: open, in_progress, resolved, closed', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
