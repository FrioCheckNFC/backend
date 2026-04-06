import { MigrationInterface, QueryRunner } from "typeorm";

export class RestoreNfcTagHardwareModel1774298000001 implements MigrationInterface {
    name = 'RestoreNfcTagHardwareModel1774298000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Restore hardware_model column if not exist
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'nfc_tags' AND column_name = 'hardware_model') THEN
                    ALTER TABLE "nfc_tags" ADD "hardware_model" character varying(20) NOT NULL DEFAULT 'NTAG215';
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nfc_tags" DROP COLUMN "hardware_model"`);
    }
}
