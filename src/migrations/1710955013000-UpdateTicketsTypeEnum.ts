import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTicketsTypeEnum1710955013000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing enum values to tickets_type_enum
    // ALTER TYPE can only ADD values, not remove them
    try {
      await queryRunner.query(
        `ALTER TYPE "tickets_type_enum" ADD VALUE 'error_nfc'`,
      );
    } catch (e) {
      // Value already exists
    }

    try {
      await queryRunner.query(
        `ALTER TYPE "tickets_type_enum" ADD VALUE 'mantenimiento'`,
      );
    } catch (e) {
      // Value already exists
    }

    try {
      await queryRunner.query(
        `ALTER TYPE "tickets_type_enum" ADD VALUE 'otro'`,
      );
    } catch (e) {
      // Value already exists
    }

    // Update status enum
    try {
      await queryRunner.query(
        `ALTER TYPE "tickets_status_enum" ADD VALUE 'en_progreso'`,
      );
    } catch (e) {
      // Value already exists
    }

    try {
      await queryRunner.query(
        `ALTER TYPE "tickets_status_enum" ADD VALUE 'cerrado'`,
      );
    } catch (e) {
      // Value already exists
    }

    try {
      await queryRunner.query(
        `ALTER TYPE "tickets_status_enum" ADD VALUE 'rechazado'`,
      );
    } catch (e) {
      // Value already exists
    }

    // Update priority enum
    try {
      await queryRunner.query(
        `ALTER TYPE "tickets_priority_enum" ADD VALUE 'baja'`,
      );
    } catch (e) {
      // Value already exists
    }

    try {
      await queryRunner.query(
        `ALTER TYPE "tickets_priority_enum" ADD VALUE 'media'`,
      );
    } catch (e) {
      // Value already exists
    }

    try {
      await queryRunner.query(
        `ALTER TYPE "tickets_priority_enum" ADD VALUE 'critica'`,
      );
    } catch (e) {
      // Value already exists
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot remove enum values in PostgreSQL, so we do nothing on down
  }
}
