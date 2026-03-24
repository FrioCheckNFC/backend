import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAllMissingColumnsToTickets1710955012000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasCanUseManualEntry = await this.columnExists(
      queryRunner,
      'tickets',
      'can_use_manual_entry',
    );
    if (!hasCanUseManualEntry) {
      await queryRunner.query(
        `ALTER TABLE "tickets" ADD COLUMN "can_use_manual_entry" BOOLEAN DEFAULT true`,
      );
    }

    const hasManualMachineId = await this.columnExists(
      queryRunner,
      'tickets',
      'manual_machine_id',
    );
    if (!hasManualMachineId) {
      await queryRunner.query(
        `ALTER TABLE "tickets" ADD COLUMN "manual_machine_id" VARCHAR(100) NULL`,
      );
    }

    const hasMachinePhotoPlateUrl = await this.columnExists(
      queryRunner,
      'tickets',
      'machine_photo_plate_url',
    );
    if (!hasMachinePhotoPlateUrl) {
      await queryRunner.query(
        `ALTER TABLE "tickets" ADD COLUMN "machine_photo_plate_url" VARCHAR(500) NULL`,
      );
    }

    const hasResolutionNotes = await this.columnExists(
      queryRunner,
      'tickets',
      'resolution_notes',
    );
    if (!hasResolutionNotes) {
      await queryRunner.query(
        `ALTER TABLE "tickets" ADD COLUMN "resolution_notes" TEXT NULL`,
      );
    }

    const hasResolvedAt = await this.columnExists(
      queryRunner,
      'tickets',
      'resolved_at',
    );
    if (!hasResolvedAt) {
      await queryRunner.query(
        `ALTER TABLE "tickets" ADD COLUMN "resolved_at" TIMESTAMP NULL`,
      );
    }

    const hasDueDate = await this.columnExists(
      queryRunner,
      'tickets',
      'due_date',
    );
    if (!hasDueDate) {
      await queryRunner.query(
        `ALTER TABLE "tickets" ADD COLUMN "due_date" TIMESTAMP NULL`,
      );
    }

    const hasTimeSpentMinutes = await this.columnExists(
      queryRunner,
      'tickets',
      'time_spent_minutes',
    );
    if (!hasTimeSpentMinutes) {
      await queryRunner.query(
        `ALTER TABLE "tickets" ADD COLUMN "time_spent_minutes" INTEGER NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      'can_use_manual_entry',
      'manual_machine_id',
      'machine_photo_plate_url',
      'resolution_notes',
      'resolved_at',
      'due_date',
      'time_spent_minutes',
    ];

    for (const col of columns) {
      const hasCol = await this.columnExists(queryRunner, 'tickets', col);
      if (hasCol) {
        await queryRunner.query(
          `ALTER TABLE "tickets" DROP COLUMN "${col}"`,
        );
      }
    }
  }

  private async columnExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<boolean> {
    const result = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`,
    );
    return result.length > 0;
  }
}
