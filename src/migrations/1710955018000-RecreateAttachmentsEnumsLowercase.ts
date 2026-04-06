import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecreateAttachmentsEnumsLowercase1710955018000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing enums
    await queryRunner.query(
      `DROP TYPE IF EXISTS attachments_type_enum CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS attachments_category_enum CASCADE`,
    );

    // Create new enums with lowercase values
    await queryRunner.query(
      `CREATE TYPE attachments_type_enum AS ENUM ('foto', 'documento', 'firma', 'video')`,
    );
    await queryRunner.query(
      `CREATE TYPE attachments_category_enum AS ENUM ('evidencia', 'antes_despues', 'daños', 'placa_maquina', 'confirmacion')`,
    );

    // Alter table to use new enums
    await queryRunner.query(
      `ALTER TABLE "attachments" ALTER COLUMN "type" TYPE attachments_type_enum USING "type"::TEXT::attachments_type_enum`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ALTER COLUMN "category" TYPE attachments_category_enum USING "category"::TEXT::attachments_category_enum`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new enums
    await queryRunner.query(
      `DROP TYPE IF EXISTS attachments_type_enum CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS attachments_category_enum CASCADE`,
    );
  }
}
