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

        // Add machine_serial_id column to nfc_tags if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'nfc_tags' AND column_name = 'machine_serial_id'
                ) THEN
                    ALTER TABLE "nfc_tags" ADD "machine_serial_id" character varying(255);
                END IF;
            END $$
        `);

        // Add tenant_id_obfuscated column to nfc_tags if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'nfc_tags' AND column_name = 'tenant_id_obfuscated'
                ) THEN
                    ALTER TABLE "nfc_tags" ADD "tenant_id_obfuscated" character varying(255);
                END IF;
            END $$
        `);

        // Add integrity_checksum column to nfc_tags if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'nfc_tags' AND column_name = 'integrity_checksum'
                ) THEN
                    ALTER TABLE "nfc_tags" ADD "integrity_checksum" character varying(255);
                END IF;
            END $$
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "location_name"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "location_lat"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "location_lng"`);
        await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN IF EXISTS "assigned_user_id"`);
        await queryRunner.query(`ALTER TABLE "nfc_tags" DROP COLUMN IF EXISTS "machine_serial_id"`);
        await queryRunner.query(`ALTER TABLE "nfc_tags" DROP COLUMN IF EXISTS "tenant_id_obfuscated"`);
        await queryRunner.query(`ALTER TABLE "nfc_tags" DROP COLUMN IF EXISTS "integrity_checksum"`);
    }
}