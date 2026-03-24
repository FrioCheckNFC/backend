import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecreateWorkOrdersTableCompletely1710955017000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, ensure enums exist and have correct values in lowercase
    await queryRunner.query(`
      DROP TYPE IF EXISTS "work_orders_type_enum" CASCADE
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "work_orders_status_enum" CASCADE
    `);

    // Create enums with lowercase values
    await queryRunner.query(`
      CREATE TYPE "work_orders_type_enum" AS ENUM (
        'entrega',
        'reposicion',
        'retiro',
        'reparacion'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "work_orders_status_enum" AS ENUM (
        'pendiente',
        'en_transito',
        'entregado',
        'rechazado',
        'cancelado'
      )
    `);

    // Drop the old work_orders table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS "work_orders" CASCADE`);

    // Create the work_orders table with CORRECT column names matching the entity
    await queryRunner.query(`
      CREATE TABLE "work_orders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "machine_id" uuid NOT NULL,
        "assigned_user_id" uuid NOT NULL,
        "visit_id" uuid,
        "type" "work_orders_type_enum" NOT NULL DEFAULT 'entrega',
        "status" "work_orders_status_enum" NOT NULL DEFAULT 'pendiente',
        "expected_nfc_uid" VARCHAR(14) NOT NULL,
        "actual_nfc_uid" VARCHAR(14),
        "nfc_validated" BOOLEAN DEFAULT false,
        "expected_location_lat" DECIMAL(10, 7) NOT NULL,
        "expected_location_lng" DECIMAL(11, 7) NOT NULL,
        "actual_location_lat" DECIMAL(10, 7),
        "actual_location_lng" DECIMAL(11, 7),
        "estimated_delivery_date" TIMESTAMP NOT NULL,
        "delivery_date" TIMESTAMP,
        "description" VARCHAR(500),
        "rejection_reason" VARCHAR(500),
        "signed_by" VARCHAR(100),
        "signature_url" VARCHAR(500),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_work_orders_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_work_orders_machine_id" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_work_orders_assigned_user_id" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_work_orders_visit_id" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL
      )
    `);

    // Create index on tenant_id for efficient queries
    await queryRunner.query(
      `CREATE INDEX "idx_work_orders_tenant_id" ON "work_orders"("tenant_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indices
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_work_orders_tenant_id"`);
    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "work_orders" CASCADE`);
  }
}
