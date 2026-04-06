import {
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsDate,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkOrderStatus, WorkOrderType } from '../entities/work-order.entity';

export class CreateWorkOrderDto {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  machineId: string;

  @IsUUID()
  assignedUserId: string;

  @IsEnum(WorkOrderType)
  type: WorkOrderType;

  @IsString()
  expectedNfcUid: string;

  @IsNumber()
  expectedLocationLat: number;

  @IsNumber()
  expectedLocationLng: number;

  @Type(() => Date)
  @IsDate()
  estimatedDeliveryDate: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  visitId?: string;
}

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @IsOptional()
  @IsString()
  actualNfcUid?: string;

  @IsOptional()
  @IsNumber()
  actualLocationLat?: number;

  @IsOptional()
  @IsNumber()
  actualLocationLng?: number;

  @IsOptional()
  @IsBoolean()
  nfcValidated?: boolean;

  @IsOptional()
  @IsDate()
  deliveryDate?: Date;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  signedBy?: string;

  @IsOptional()
  @IsString()
  signatureUrl?: string;
}

export class WorkOrderResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsUUID()
  machineId: string;

  @IsUUID()
  assignedUserId: string;

  @IsEnum(WorkOrderType)
  type: WorkOrderType;

  @IsEnum(WorkOrderStatus)
  status: WorkOrderStatus;

  @IsString()
  expectedNfcUid: string;

  @IsOptional()
  @IsString()
  actualNfcUid?: string;

  @IsBoolean()
  nfcValidated: boolean;

  @IsDate()
  estimatedDeliveryDate: Date;

  @IsOptional()
  @IsDate()
  deliveryDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}
