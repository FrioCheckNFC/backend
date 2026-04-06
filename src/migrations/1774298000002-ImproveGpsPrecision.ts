import { MigrationInterface, QueryRunner } from "typeorm";

export class ImproveGpsPrecision1774298000002 implements MigrationInterface {
    name = 'ImproveGpsPrecision1774298000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Improve GPS precision from scale 7 to scale 8 (±1.1m instead of ±11m)
        
        // Machines table
        await queryRunner.query(`ALTER TABLE "machines" ALTER COLUMN "location_lat" TYPE numeric(10,8)`);
        await queryRunner.query(`ALTER TABLE "machines" ALTER COLUMN "location_lng" TYPE numeric(11,8)`);
        
        // Visits table
        await queryRunner.query(`ALTER TABLE "visits" ALTER COLUMN "check_in_gps_lat" TYPE numeric(10,8)`);
        await queryRunner.query(`ALTER TABLE "visits" ALTER COLUMN "check_in_gps_lng" TYPE numeric(11,8)`);
        await queryRunner.query(`ALTER TABLE "visits" ALTER COLUMN "check_out_gps_lat" TYPE numeric(10,8)`);
        await queryRunner.query(`ALTER TABLE "visits" ALTER COLUMN "check_out_gps_lng" TYPE numeric(11,8)`);
        
        // Work Orders table
        await queryRunner.query(`ALTER TABLE "work_orders" ALTER COLUMN "expected_location_lat" TYPE numeric(10,8)`);
        await queryRunner.query(`ALTER TABLE "work_orders" ALTER COLUMN "expected_location_lng" TYPE numeric(11,8)`);
        await queryRunner.query(`ALTER TABLE "work_orders" ALTER COLUMN "actual_location_lat" TYPE numeric(10,8)`);
        await queryRunner.query(`ALTER TABLE "work_orders" ALTER COLUMN "actual_location_lng" TYPE numeric(11,8)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to lower precision
        await queryRunner.query(`ALTER TABLE "machines" ALTER COLUMN "location_lat" TYPE numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "machines" ALTER COLUMN "location_lng" TYPE numeric(10,7)`);
        
        await queryRunner.query(`ALTER TABLE "visits" ALTER COLUMN "check_in_gps_lat" TYPE numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "visits" ALTER COLUMN "check_in_gps_lng" TYPE numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "visits" ALTER COLUMN "check_out_gps_lat" TYPE numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "visits" ALTER COLUMN "check_out_gps_lng" TYPE numeric(10,7)`);
        
        await queryRunner.query(`ALTER TABLE "work_orders" ALTER COLUMN "expected_location_lat" TYPE numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "work_orders" ALTER COLUMN "expected_location_lng" TYPE numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "work_orders" ALTER COLUMN "actual_location_lat" TYPE numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "work_orders" ALTER COLUMN "actual_location_lng" TYPE numeric(10,7)`);
    }
}
