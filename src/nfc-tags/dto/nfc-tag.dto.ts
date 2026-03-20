import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateNfcTagDto {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  machineId: string;

  @IsString()
  uid: string;

  @IsString()
  machineSerialId: string;

  @IsString()
  tenantIdObfuscated: string;

  @IsString()
  integrityChecksum: string;
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
  housing: string;

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
