import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSectorDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  comuna?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;
}

export class UpdateSectorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
