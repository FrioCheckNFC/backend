import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEstimatedDeliveryDateToWorkorders1710955016000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add estimated_delivery_date column if it doesn't exist
    const table = await queryRunner.getTable('work_orders');
    
    if (!table?.findColumnByName('estimated_delivery_date')) {
      await queryRunner.query(
        `ALTER TABLE "work_orders" ADD COLUMN "estimated_delivery_date" TIMESTAMP`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('work_orders');
    
    if (table?.findColumnByName('estimated_delivery_date')) {
      await queryRunner.dropColumn('work_orders', 'estimated_delivery_date');
    }
  }
}
