import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateNfcTagDto {
  @IsUUID()
  @IsOptional()
  tenantId: string;

  @IsUUID()
  machineId: string;

  @IsString()
  uid: string;

  @IsString()
  @IsOptional()
  machineSerialId?: string;

  @IsString()
  @IsOptional()
  tenantIdObfuscated?: string;

  @IsString()
  @IsOptional()
  integrityChecksum?: string;

  @IsString()
  @IsOptional()
  tagModel?: string;
}

export class NfcTagResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsUUID()
  machineId: string;

  @IsString()
  uid: string;

  @IsString()
  tagModel: string;

  @IsString()
  machineSerialId: string;

  @IsString()
  tenantIdObfuscated: string;

  @IsString()
  integrityChecksum: string;

  isLocked: boolean;

  isActive: boolean;

  createdAt: Date;
}
