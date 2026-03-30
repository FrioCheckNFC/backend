import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTicketStatusEnum1774298000003 implements MigrationInterface {
    name = 'FixTicketStatusEnum1774298000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop old enum and recreate with correct values
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum" AS ENUM('abierto', 'en_progreso', 'resuelto', 'cerrado')`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" TYPE "public"."tickets_status_enum" USING 'abierto'::"public"."tickets_status_enum"`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" SET DEFAULT 'abierto'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum" AS ENUM('abierto', 'en_progreso', 'cerrado', 'rechazado')`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" TYPE "public"."tickets_status_enum" USING 'abierto'::"public"."tickets_status_enum"`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" SET DEFAULT 'abierto'`);
    }
}
