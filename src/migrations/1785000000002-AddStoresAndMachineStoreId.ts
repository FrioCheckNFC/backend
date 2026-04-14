import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoresAndMachineStoreId1785000000002 implements MigrationInterface {
    name = 'AddStoresAndMachineStoreId1785000000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create stores table if it doesn't exist
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "stores" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "tenant_id" uuid NOT NULL,
                "sector_id" uuid,
                "retailer_id" uuid,
                "name" character varying(255) NOT NULL,
                "address" character varying(255),
                "latitude" numeric(10,8),
                "longitude" numeric(11,8),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_stores_id" PRIMARY KEY ("id")
            )
        `);

        // Add foreign keys for stores (skip if they already exist)
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_stores_tenant') THEN
                    ALTER TABLE "stores" ADD CONSTRAINT "FK_stores_tenant"
                        FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END $$
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_stores_sector') THEN
                    ALTER TABLE "stores" ADD CONSTRAINT "FK_stores_sector"
                        FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END $$
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_stores_retailer') THEN
                    ALTER TABLE "stores" ADD CONSTRAINT "FK_stores_retailer"
                        FOREIGN KEY ("retailer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END $$
        `);

        // Add store_id column to machines if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'machines' AND column_name = 'store_id'
                ) THEN
                    ALTER TABLE "machines" ADD "store_id" uuid;
                END IF;
            END $$
        `);

        // Add FK from machines.store_id -> stores.id
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_machines_store') THEN
                    ALTER TABLE "machines" ADD CONSTRAINT "FK_machines_store"
                        FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END $$
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "machines" DROP CONSTRAINT IF EXISTS "FK_machines_store"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT IF EXISTS "FK_stores_retailer"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT IF EXISTS "FK_stores_sector"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT IF EXISTS "FK_stores_tenant"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "store_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "stores"`);
    }
}
