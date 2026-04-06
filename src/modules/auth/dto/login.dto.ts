// DTO = Data Transfer Object.
// Define la forma exacta del JSON que el frontend manda al endpoint POST /auth/login.
// Los decoradores @IsNotEmpty y @IsString validan automaticamente
// y rechazan el request si faltan campos o tienen tipo incorrecto.

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  // Email del usuario (campo unico en la BD, se usa para login)
  @ApiProperty({
    example: 'admin@friocheck.com o 12345678-9',
    description: 'Email o RUT del usuario',
  })
  @IsOptional()
  @IsString()
  email?: string;

  // RUT del usuario (para login desde app móvil)
  @ApiProperty({
    example: '12345678-9',
    description: 'RUT del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  rut?: string;

  // Contrasena en texto plano (se compara contra el hash en la BD)
  @ApiProperty({ example: 'miClave123', description: 'Contrasena del usuario' })
  @IsNotEmpty({ message: 'La contrasena es obligatoria' })
  @IsString()
  password: string;
}
