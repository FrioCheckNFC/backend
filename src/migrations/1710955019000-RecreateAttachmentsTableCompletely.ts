import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecreateAttachmentsTableCompletely1710955019000
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

    // Drop existing table
    await queryRunner.query(`DROP TABLE IF EXISTS "attachments" CASCADE`);

    // Create new enums with lowercase values
    await queryRunner.query(
      `CREATE TYPE attachments_type_enum AS ENUM ('foto', 'documento', 'firma', 'video')`,
    );
    await queryRunner.query(
      `CREATE TYPE attachments_category_enum AS ENUM ('evidencia', 'antes_despues', 'daños', 'placa_maquina', 'confirmacion')`,
    );

    // Recreate the table with all columns
    await queryRunner.query(`
      CREATE TABLE "attachments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "uploaded_by_id" uuid NOT NULL,
        "visit_id" uuid,
        "work_order_id" uuid,
        "ticket_id" uuid,
        "type" attachments_type_enum NOT NULL,
        "category" attachments_category_enum NOT NULL,
        "file_name" VARCHAR(255) NOT NULL,
        "file_size_bytes" INTEGER NOT NULL,
        "mime_type" VARCHAR(100) NOT NULL,
        "azure_blob_url" VARCHAR(500) NOT NULL,
        "description" VARCHAR(500),
        "metadata" JSON,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_attachments_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_attachments_uploaded_by" FOREIGN KEY ("uploaded_by_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_attachments_visit" FOREIGN KEY ("visit_id") REFERENCES "visits" ("id") ON DELETE SET NULL,
        CONSTRAINT "fk_attachments_work_order" FOREIGN KEY ("work_order_id") REFERENCES "work_orders" ("id") ON DELETE SET NULL,
        CONSTRAINT "fk_attachments_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets" ("id") ON DELETE SET NULL
      )
    `);

    // Create index
    await queryRunner.query(
      `CREATE INDEX "idx_attachments_tenant_id" ON "attachments" ("tenant_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table and enums
    await queryRunner.query(`DROP TABLE IF EXISTS "attachments" CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS attachments_type_enum CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS attachments_category_enum CASCADE`,
    );
  }
}
