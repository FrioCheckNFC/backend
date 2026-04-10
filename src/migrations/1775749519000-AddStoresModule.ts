import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoresModule1775749519000 implements MigrationInterface {
    name = 'AddStoresModule1775749519000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create stores table
        await queryRunner.query(`CREATE TABLE "stores" (
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
        )`);

        // Add store_id to machines
        await queryRunner.query(`ALTER TABLE "machines" ADD "store_id" uuid`);

        // Foreign keys for stores
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_stores_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_stores_sector" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_stores_retailer" FOREIGN KEY ("retailer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Foreign key for machines
        await queryRunner.query(`ALTER TABLE "machines" ADD CONSTRAINT "FK_machines_store" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "machines" DROP CONSTRAINT "FK_machines_store"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_stores_retailer"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_stores_sector"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_stores_tenant"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN "store_id"`);
        await queryRunner.query(`DROP TABLE "stores"`);
    }
}
