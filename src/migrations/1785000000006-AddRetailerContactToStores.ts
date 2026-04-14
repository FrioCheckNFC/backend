import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRetailerContactToStores1785000000006 implements MigrationInterface {
    name = 'AddRetailerContactToStores1785000000006';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "retailer_phone" character varying(20)
        `);
        await queryRunner.query(`
            ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "retailer_email" character varying(255)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN IF EXISTS "retailer_phone"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN IF EXISTS "retailer_email"`);
    }
}