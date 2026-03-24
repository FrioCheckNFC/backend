import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMachineStatusEnum1710950000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primero, cambiar a TEXT tipo para poder update sin validación de enum
    await queryRunner.query(
      `ALTER TABLE "machines" ALTER COLUMN "status" TYPE TEXT`,
    );

    // Actualizar los valores existentes
    await queryRunner.query(
      `UPDATE "machines" SET "status" = 'ACTIVE' WHERE "status" = 'DISPONIBLE'`,
    );
    await queryRunner.query(
      `UPDATE "machines" SET "status" = 'ACTIVE' WHERE "status" = 'EN_USO'`,
    );
    await queryRunner.query(
      `UPDATE "machines" SET "status" = 'MAINTENANCE' WHERE "status" = 'EN_MANTENIMIENTO'`,
    );
    await queryRunner.query(
      `UPDATE "machines" SET "status" = 'DECOMMISSIONED' WHERE "status" = 'EN_RETIRO'`,
    );

    // Dropear el tipo enum antiguo (primero quitar de la tabla)
    await queryRunner.query(`DROP TYPE IF EXISTS "machines_status_enum" CASCADE`);

    // Crear nuevo tipo enum con valores correctos según spec
    await queryRunner.query(
      `CREATE TYPE "machines_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'IN_TRANSIT', 'MAINTENANCE', 'DECOMMISSIONED')`,
    );

    // Convertir la columna al nuevo tipo enum
    await queryRunner.query(
      `ALTER TABLE "machines" ALTER COLUMN "status" TYPE "machines_status_enum" USING "status"::text::"machines_status_enum"`,
    );

    // Actualizar el default value
    await queryRunner.query(
      `ALTER TABLE "machines" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cambiar a TEXT primero
    await queryRunner.query(
      `ALTER TABLE "machines" ALTER COLUMN "status" TYPE TEXT`,
    );

    // Revertir los valores
    await queryRunner.query(
      `UPDATE "machines" SET "status" = 'DISPONIBLE' WHERE "status" = 'ACTIVE' LIMIT 1`,
    );
    
    // Dropear el tipo nuevo
    await queryRunner.query(`DROP TYPE IF EXISTS "machines_status_enum" CASCADE`);

    // Recrear el tipo antiguo
    await queryRunner.query(
      `CREATE TYPE "machines_status_enum" AS ENUM('DISPONIBLE', 'EN_USO', 'EN_MANTENIMIENTO', 'EN_RETIRO')`,
    );

    // Convertir la columna back
    await queryRunner.query(
      `ALTER TABLE "machines" ALTER COLUMN "status" TYPE "machines_status_enum" USING "status"::text::"machines_status_enum"`,
    );

    // Actualizar el default value
    await queryRunner.query(
      `ALTER TABLE "machines" ALTER COLUMN "status" SET DEFAULT 'DISPONIBLE'`,
    );
  }
}
