import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123xyz...',
    description: 'Token de recuperacion',
  })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'nuevaContrasena123',
    description: 'Nueva contrasena (min 8 caracteres)',
  })
  @IsNotEmpty({ message: 'La nueva contrasena es obligatoria' })
  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  newPassword: string;
}
