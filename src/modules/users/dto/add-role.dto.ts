import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn } from 'class-validator';

export class AddRoleDto {
  @ApiProperty({
    example: 'VENDOR',
    description:
      'Rol a agregar: ADMIN, SUPPORT, VENDOR, RETAILER, TECHNICIAN, DRIVER',
    enum: ['ADMIN', 'SUPPORT', 'VENDOR', 'RETAILER', 'TECHNICIAN', 'DRIVER'],
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsIn(['ADMIN', 'SUPPORT', 'VENDOR', 'RETAILER', 'TECHNICIAN', 'DRIVER'], {
    message: 'Rol inválido',
  })
  role: string;
}
