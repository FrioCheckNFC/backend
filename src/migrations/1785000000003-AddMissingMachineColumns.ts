import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingMachineColumns1785000000003 implements MigrationInterface {
    name = 'AddMissingMachineColumns1785000000003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add location_name column if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'machines' AND column_name = 'location_name'
                ) THEN
                    ALTER TABLE "machines" ADD "location_name" character varying(255);
                END IF;
            END $$
        `);

        // Add location_lat column if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'machines' AND column_name = 'location_lat'
                ) THEN
                    ALTER TABLE "machines" ADD "location_lat" float;
                END IF;
            END $$
        `);

        // Add location_lng column if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'machines' AND column_name = 'location_lng'
                ) THEN
                    ALTER TABLE "machines" ADD "location_lng" float;
                END IF;
            END $$
        `);

        // Add assigned_user_id column if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'machines' AND column_name = 'assigned_user_id'
                ) THEN
                    ALTER TABLE "machines" ADD "assigned_user_id" uuid;
                END IF;
            END $$
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "location_name"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "location_lat"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "location_lng"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "assigned_user_id"`);
    }
}