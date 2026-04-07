import { MigrationInterface, QueryRunner } from "typeorm";

export class UserRoleToArray1780000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 0. Eliminar la vista que depende de la columna (si existe)
    await queryRunner.query(`DROP VIEW IF EXISTS users_view`);

    // 1. Renombrar la columna actual para no perder datos
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "role" TO "role_old"`);

    // 2. Crear la nueva columna como arreglo de texto
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "role" text[] NOT NULL DEFAULT '{}'`);

    // 3. Migrar el valor antiguo (string) a array (si existía)
    await queryRunner.query(`UPDATE "users" SET "role" = ARRAY[role_old] WHERE role_old IS NOT NULL`);

    // 4. Eliminar la columna antigua
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_old"`);

    // 5. (Opcional) Vuelve a crear la vista users_view aquí si tienes el SQL de la vista
    // await queryRunner.query(`CREATE VIEW users_view AS ...`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 0. Eliminar la vista antes de revertir la columna
    await queryRunner.query(`DROP VIEW IF EXISTS users_view`);

    // 1. Agregar la columna antigua como string (enum si lo deseas)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "role_old" text`);

    // 2. Migrar el primer valor del array a la columna antigua
    await queryRunner.query(`UPDATE "users" SET "role_old" = role[1] WHERE role IS NOT NULL AND array_length(role, 1) > 0`);

    // 3. Eliminar la columna nueva
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);

    // 4. Renombrar la columna antigua a su nombre original
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "role_old" TO "role"`);

    // 5. (Opcional) Vuelve a crear la vista users_view aquí si tienes el SQL de la vista
    // await queryRunner.query(`CREATE VIEW users_view AS ...`);
  }
}
