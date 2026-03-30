import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  identifier?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  tenantId: string;

  role?: string;
}
