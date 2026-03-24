import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFkColumnsSyncQueue1710955000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add tenant_id column if it doesn't exist
    await queryRunner.query(
      `ALTER TABLE "sync_queue" ADD COLUMN IF NOT EXISTS "tenant_id" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'`,
    );

    // Add user_id column if it doesn't exist
    await queryRunner.query(
      `ALTER TABLE "sync_queue" ADD COLUMN IF NOT EXISTS "user_id" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'`,
    );

    // Add foreign key constraint for tenant_id
    await queryRunner.query(
      `ALTER TABLE "sync_queue" ADD CONSTRAINT "FK_sync_queue_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE`,
    ).catch(() => {
      // Ignore if constraint already exists
    });

    // Add foreign key constraint for user_id
    await queryRunner.query(
      `ALTER TABLE "sync_queue" ADD CONSTRAINT "FK_sync_queue_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    ).catch(() => {
      // Ignore if constraint already exists
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "sync_queue" DROP CONSTRAINT IF EXISTS "FK_sync_queue_user_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "sync_queue" DROP CONSTRAINT IF EXISTS "FK_sync_queue_tenant_id"`,
    );

    // Remove columns
    await queryRunner.query(
      `ALTER TABLE "sync_queue" DROP COLUMN IF EXISTS "user_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "sync_queue" DROP COLUMN IF EXISTS "tenant_id"`,
    );
  }
}
