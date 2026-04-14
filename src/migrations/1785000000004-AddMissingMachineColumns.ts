import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingMachineColumns1785000000004 implements MigrationInterface {
    name = 'AddMissingMachineColumns1785000000004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "machines" ADD COLUMN IF NOT EXISTS "location_name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "machines" ADD COLUMN IF NOT EXISTS "location_lat" float`);
        await queryRunner.query(`ALTER TABLE "machines" ADD COLUMN IF NOT EXISTS "location_lng" float`);
        await queryRunner.query(`ALTER TABLE "machines" ADD COLUMN IF NOT EXISTS "assigned_user_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "location_name"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "location_lat"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "location_lng"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "assigned_user_id"`);
    }
}