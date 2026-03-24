import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecreateTicketsEnumsLowercase1710955014000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the columns that use the enums first
    const table = await queryRunner.getTable('tickets');
    
    if (table?.findColumnByName('type')) {
      await queryRunner.dropColumn('tickets', 'type');
    }
    if (table?.findColumnByName('status')) {
      await queryRunner.dropColumn('tickets', 'status');
    }
    if (table?.findColumnByName('priority')) {
      await queryRunner.dropColumn('tickets', 'priority');
    }

    // Drop the old enum types
    try {
      await queryRunner.query(`DROP TYPE IF EXISTS "tickets_type_enum"`);
    } catch (e) {
      // Already dropped or doesn't exist
    }
    try {
      await queryRunner.query(`DROP TYPE IF EXISTS "tickets_status_enum"`);
    } catch (e) {
      // Already dropped or doesn't exist
    }
    try {
      await queryRunner.query(`DROP TYPE IF EXISTS "tickets_priority_enum"`);
    } catch (e) {
      // Already dropped or doesn't exist
    }

    // Create new enum types with lowercase values
    await queryRunner.query(`
      CREATE TYPE "tickets_type_enum" AS ENUM (
        'falla',
        'merma',
        'error_nfc',
        'mantenimiento',
        'otro'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "tickets_status_enum" AS ENUM (
        'abierto',
        'en_progreso',
        'cerrado',
        'rechazado'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "tickets_priority_enum" AS ENUM (
        'baja',
        'media',
        'alta',
        'critica'
      )
    `);

    // Recreate columns with new enums and proper defaults
    await queryRunner.query(`
      ALTER TABLE "tickets"
      ADD COLUMN "type" "tickets_type_enum" NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tickets"
      ADD COLUMN "status" "tickets_status_enum" DEFAULT 'abierto'
    `);

    await queryRunner.query(`
      ALTER TABLE "tickets"
      ADD COLUMN "priority" "tickets_priority_enum" DEFAULT 'media'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed - this is complex, so keeping it simple
    // In production you would restore from backup
  }
}
