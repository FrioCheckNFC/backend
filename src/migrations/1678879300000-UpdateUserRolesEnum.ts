import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserRolesEnum1678879300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primero, cambiar la columna a TEXT temporalmente
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role TYPE text
    `);

    // Mapear valores antiguos a nuevos
    await queryRunner.query(`
      UPDATE users SET role = 'ADMIN' WHERE role IN ('SUPER_ADMIN', 'ADMIN_TENANT')
    `);

    await queryRunner.query(`
      UPDATE users SET role = 'VENDOR' WHERE role = 'VENDEDOR'
    `);

    await queryRunner.query(`
      UPDATE users SET role = 'TECHNICIAN' WHERE role = 'TECNICO'
    `);

    await queryRunner.query(`
      UPDATE users SET role = 'DRIVER' WHERE role = 'TRANSPORTISTA'
    `);

    await queryRunner.query(`
      UPDATE users SET role = 'RETAILER' WHERE role = 'MINORISTA'
    `);

    // Eliminar el enum viejo
    await queryRunner.query(`
      DROP TYPE "users_role_enum"
    `);

    // Crear el nuevo enum
    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('ADMIN', 'SUPPORT', 'VENDOR', 'RETAILER', 'TECHNICIAN', 'DRIVER')
    `);

    // Cambiar de vuelta a enum
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role TYPE "users_role_enum" USING role::"users_role_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No hacer downgrade para evitar pérdida de datos
  }
}
