import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSectorDto {
  @IsString()
  comuna: string;

  @IsString()
  city: string;

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
  comuna?: string;

  @IsOptional()
  @IsString()
  city?: string;

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
