import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDecimal,
  IsDate,
} from 'class-validator';
import { MachineStatus } from '../entities/machine.entity';

export class CreateMachineDto {
  @IsUUID()
  tenantId: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsString()
  serialNumber: string;

  @IsString()
  locationName: string;

  @IsOptional()
  @IsDecimal()
  locationLat?: number;

  @IsOptional()
  @IsDecimal()
  locationLng?: number;

  @IsOptional()
  @IsUUID()
  assignedUserId: string;

  @IsOptional()
  @IsDate()
  installedAt?: Date;
}

export class UpdateMachineDto {
  @IsOptional()
  @IsString()
  locationName?: string;

  @IsOptional()
  @IsDecimal()
  locationLat?: number;

  @IsOptional()
  @IsDecimal()
  locationLng?: number;

  @IsOptional()
  @IsEnum(MachineStatus)
  status?: MachineStatus;

  @IsOptional()
  @IsUUID()
  assignedUserId?: string;
}

export class MachineResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsString()
  serialNumber: string;

  @IsString()
  locationName: string;

  @IsOptional()
  @IsDecimal()
  locationLat?: number;

  @IsOptional()
  @IsDecimal()
  locationLng?: number;

  @IsEnum(MachineStatus)
  status: MachineStatus;

  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
