import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSectorDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSectorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
