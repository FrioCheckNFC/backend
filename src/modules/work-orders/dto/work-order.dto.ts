import { IsString, IsOptional, IsUUID, IsIn, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateWorkOrderDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsUUID()
  machineId?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto) {
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'completed', 'rejected', 'cancelled'])
  status?: string;
}

export class ValidateNfcDto {
  @IsString()
  actualNfcUid: string;
}
