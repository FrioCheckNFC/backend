import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAcquisitionType1785000000010 implements MigrationInterface {
    name = 'AddAcquisitionType1785000000010';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "machines" ADD COLUMN IF NOT EXISTS "acquisition_type" character varying(20)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "acquisition_type"`);
    }
}