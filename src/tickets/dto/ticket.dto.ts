import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDate,
} from 'class-validator';
import { TicketStatus, TicketType, TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsUUID()
  machineId?: string;

  @IsUUID()
  reportedById: string;

  @IsEnum(TicketType)
  type: TicketType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  // Alternativas si no se puede usar NFC
  @IsOptional()
  @IsString()
  manualMachineId?: string;

  @IsOptional()
  @IsString()
  machinePhotoPlateUrl?: string;

  @IsOptional()
  @IsDate()
  dueDate?: Date;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  @IsUUID()
  resolvedById?: string;

  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  timeSpentMinutes?: number;
}

export class TicketResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsUUID()
  machineId?: string;

  @IsUUID()
  reportedById: string;

  @IsEnum(TicketType)
  type: TicketType;

  @IsEnum(TicketStatus)
  status: TicketStatus;

  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  manualMachineId?: string;

  @IsOptional()
  @IsString()
  machinePhotoPlateUrl?: string;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  @IsDate()
  resolvedAt?: Date;

  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  timeSpentMinutes?: number;

  createdAt: Date;
  updatedAt: Date;
}
