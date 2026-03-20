import {
  IsString,
  IsUUID,
  IsEnum,
  IsDecimal,
  IsDate,
  IsOptional,
  IsBoolean,
} from 'class-validator';
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

  @IsDecimal()
  expectedLocationLat: number;

  @IsDecimal()
  expectedLocationLng: number;

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
  @IsDecimal()
  actualLocationLat?: number;

  @IsOptional()
  @IsDecimal()
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
