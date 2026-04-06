import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTicketsTableCompletely1710955015000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old tickets table and recreate it with correct schema
    await queryRunner.query(`DROP TABLE IF EXISTS "tickets" CASCADE`);

    // Create the tickets table with CORRECT column names matching the entity
    await queryRunner.query(`
      CREATE TABLE "tickets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "machine_id" uuid,
        "reported_by_id" uuid NOT NULL,
        "assigned_to_id" uuid,
        "resolved_by_id" uuid,
        "type" "tickets_type_enum" NOT NULL,
        "status" "tickets_status_enum" NOT NULL DEFAULT 'abierto',
        "priority" "tickets_priority_enum" NOT NULL DEFAULT 'media',
        "title" VARCHAR(200) NOT NULL,
        "description" TEXT NOT NULL,
        "can_use_manual_entry" BOOLEAN DEFAULT true,
        "manual_machine_id" VARCHAR(100),
        "machine_photo_plate_url" VARCHAR(500),
        "resolution_notes" TEXT,
        "resolved_at" TIMESTAMP,
        "due_date" TIMESTAMP,
        "time_spent_minutes" INTEGER,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_tickets_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_tickets_machine_id" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_tickets_reported_by_id" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_tickets_assigned_to_id" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_tickets_resolved_by_id" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create index on tenant_id for efficient queries
    await queryRunner.query(
      `CREATE INDEX "idx_tickets_tenant_id" ON "tickets"("tenant_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indices
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tickets_tenant_id"`);
    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "tickets" CASCADE`);
  }
}
