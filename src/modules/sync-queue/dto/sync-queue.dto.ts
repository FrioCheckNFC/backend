import { IsString, IsUUID, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { SyncOperationType, SyncStatus } from '../entities/sync-queue.entity';

export class CreateSyncQueueDto {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  userId: string;

  @IsEnum(SyncOperationType)
  operationType: SyncOperationType;

  payload: Record<string, any>;
}

export class UpdateSyncQueueDto {
  @IsOptional()
  @IsEnum(SyncStatus)
  status?: SyncStatus;

  @IsOptional()
  @IsNumber()
  retryCount?: number;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;
}

export class SyncQueueResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsUUID()
  userId: string;

  @IsEnum(SyncOperationType)
  operationType: SyncOperationType;

  @IsEnum(SyncStatus)
  status: SyncStatus;

  @IsNumber()
  retryCount: number;

  @IsNumber()
  maxRetries: number;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  createdAt: Date;
  updatedAt: Date;
}
