import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSyncQueueSchema1774298000000 implements MigrationInterface {
    name = 'FixSyncQueueSchema1774298000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop old enum and recreate with correct values
        await queryRunner.query(`DROP TYPE "public"."sync_queue_operationtype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."sync_queue_operationtype_enum" AS ENUM('visit_check_in', 'visit_check_out', 'work_order_delivery', 'ticket_report', 'ticket_update', 'attachment_upload')`);
        await queryRunner.query(`ALTER TABLE "sync_queue" ALTER COLUMN "operationType" TYPE "public"."sync_queue_operationtype_enum"`);

        // Add missing error tracking columns if not exist
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'sync_queue' AND column_name = 'max_retries') THEN
                    ALTER TABLE "sync_queue" ADD "max_retries" integer NOT NULL DEFAULT 3;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'sync_queue' AND column_name = 'error_message') THEN
                    ALTER TABLE "sync_queue" ADD "error_message" text;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'sync_queue' AND column_name = 'error_stack') THEN
                    ALTER TABLE "sync_queue" ADD "error_stack" text;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'sync_queue' AND column_name = 'next_retry_at') THEN
                    ALTER TABLE "sync_queue" ADD "next_retry_at" TIMESTAMP;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to old enum
        await queryRunner.query(`DROP TYPE "public"."sync_queue_operationtype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."sync_queue_operationtype_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE')`);
        await queryRunner.query(`ALTER TABLE "sync_queue" ALTER COLUMN "operationType" TYPE "public"."sync_queue_operationtype_enum"`);

        // Drop added columns
        await queryRunner.query(`ALTER TABLE "sync_queue" DROP COLUMN "max_retries"`);
        await queryRunner.query(`ALTER TABLE "sync_queue" DROP COLUMN "error_message"`);
        await queryRunner.query(`ALTER TABLE "sync_queue" DROP COLUMN "error_stack"`);
        await queryRunner.query(`ALTER TABLE "sync_queue" DROP COLUMN "next_retry_at"`);
    }
}
