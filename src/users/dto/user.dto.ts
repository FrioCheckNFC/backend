import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  fullName?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  phone?: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsUUID()
  createdByUserId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  fcmToken?: string;
}

export class UserResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  phone?: string;

  @IsEnum(UserRole)
  role: UserRole;

  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// DTOs para gestión de roles
export class AddRoleDto {
  @IsString()
  role: string;
}

export class SetRolesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  roles: string[];
}
