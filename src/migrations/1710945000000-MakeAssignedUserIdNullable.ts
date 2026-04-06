import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeAssignedUserIdNullable1710945000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alter the assigned_user_id column to allow NULL values
    await queryRunner.query(
      `ALTER TABLE "machines" ALTER COLUMN "assigned_user_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the change if needed
    await queryRunner.query(
      `ALTER TABLE "machines" ALTER COLUMN "assigned_user_id" SET NOT NULL`,
    );
  }
}
