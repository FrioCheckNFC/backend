// DTO para registrar un usuario nuevo.
// FIX #2: eliminado el campo 'role/roles' — /auth/register es público y
// nunca debe permitir elegir rol. El default siempre es TECHNICIAN.
// Para crear ADMINs, un admin debe usar POST /api/v1/users (protegido con JWT+ADMIN).

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsUUID,
  IsOptional,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'tecnico@friocheck.com',
    description: 'Email del usuario',
  })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @ApiProperty({
    example: '12345678-9',
    description: 'RUT del usuario (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  rut?: string;

  @ApiProperty({ example: 'miClave123', description: 'Contrasena (min 8 caracteres)' })
  @IsNotEmpty({ message: 'La contrasena es obligatoria' })
  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Perez', description: 'Apellido' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del tenant',
  })
  @IsNotEmpty()
  @IsUUID()
  tenantId: string;
}
