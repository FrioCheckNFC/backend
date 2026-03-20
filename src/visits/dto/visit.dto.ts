import { IsString, IsUUID, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { VisitStatus } from '../entities/visit.entity';

export class CheckInVisitDto {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  machineId: string;

  @IsString()
  checkInNfcUid: string;

  @IsNumber()
  checkInGpsLat: number;

  @IsNumber()
  checkInGpsLng: number;
}

export class CheckOutVisitDto {
  @IsUUID()
  visitId: string;

  @IsString()
  checkOutNfcUid: string;

  @IsNumber()
  checkOutGpsLat: number;

  @IsNumber()
  checkOutGpsLng: number;
}

export class VisitResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  machineId: string;

  checkInTimestamp: Date;

  @IsOptional()
  checkOutTimestamp?: Date;

  @IsString()
  checkInNfcUid: string;

  @IsOptional()
  @IsString()
  checkOutNfcUid?: string;

  @IsNumber()
  checkInGpsLat: number;

  @IsNumber()
  checkInGpsLng: number;

  @IsOptional()
  @IsNumber()
  checkOutGpsLat?: number;

  @IsOptional()
  @IsNumber()
  checkOutGpsLng?: number;

  @IsEnum(VisitStatus)
  status: VisitStatus;

  isValid: boolean;

  @IsOptional()
  @IsString()
  validationNotes?: string;

  createdAt: Date;
}
