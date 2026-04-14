import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMachineStatusValues1785000000007 implements MigrationInterface {
    name = 'UpdateMachineStatusValues1785000000007';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Actualizar statuses old a los nuevos
        await queryRunner.query(`UPDATE "machines" SET "status" = 'ACTIVE' WHERE "status" IN ('OPERATIVE', 'PENDING_INSTALL', NULL) OR "status" IS NULL`);
        await queryRunner.query(`UPDATE "machines" SET "status" = 'OUT_OF_SERVICE' WHERE "status" = 'INACTIVE'`);
        
        // Limpiar location_name si está vacío o null
        await queryRunner.query(`UPDATE "machines" SET "location_name" = NULL WHERE "location_name" = ''`);
        await queryRunner.query(`UPDATE "machines" SET "location_name" = NULL WHERE "location_name" IS NULL`);
        
        // Limpiar location_lat y location_lng si están en 0
        await queryRunner.query(`UPDATE "machines" SET "location_lat" = NULL WHERE "location_lat" = 0`);
        await queryRunner.query(`UPDATE "machines" SET "location_lng" = NULL WHERE "location_lng" = 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No hay rollback para datos
    }
}