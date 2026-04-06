import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

const VALID_ROLES = [
  'ADMIN',
  'SUPPORT',
  'VENDOR',
  'RETAILER',
  'TECHNICIAN',
  'DRIVER',
] as const;

export class RemoveRoleDto {
  @ApiProperty({
    example: 'VENDOR',
    description:
      'Rol a eliminar: ADMIN, SUPPORT, VENDOR, RETAILER, TECHNICIAN, DRIVER',
    enum: VALID_ROLES,
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsString()
  role: string;
}
