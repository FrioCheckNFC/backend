import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFkColumnsWorkOrders1710955003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('work_orders');
    if (!table) return;

    // Add tenant_id if it doesn't exist
    if (!table.findColumnByName('tenant_id')) {
      await queryRunner.addColumn(
        'work_orders',
        new TableColumn({
          name: 'tenant_id',
          type: 'uuid',
          isNullable: false,
        }),
      );
    }

    // Add machine_id if it doesn't exist
    if (!table.findColumnByName('machine_id')) {
      await queryRunner.addColumn(
        'work_orders',
        new TableColumn({
          name: 'machine_id',
          type: 'uuid',
          isNullable: false,
        }),
      );
    }

    // Add assigned_user_id if it doesn't exist
    if (!table.findColumnByName('assigned_user_id')) {
      await queryRunner.addColumn(
        'work_orders',
        new TableColumn({
          name: 'assigned_user_id',
          type: 'uuid',
          isNullable: false,
        }),
      );
    }

    // Add visit_id if it doesn't exist
    if (!table.findColumnByName('visit_id')) {
      await queryRunner.addColumn(
        'work_orders',
        new TableColumn({
          name: 'visit_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('work_orders');
    if (!table) return;

    if (table.findColumnByName('tenant_id')) {
      await queryRunner.dropColumn('work_orders', 'tenant_id');
    }
    if (table.findColumnByName('machine_id')) {
      await queryRunner.dropColumn('work_orders', 'machine_id');
    }
    if (table.findColumnByName('assigned_user_id')) {
      await queryRunner.dropColumn('work_orders', 'assigned_user_id');
    }
    if (table.findColumnByName('visit_id')) {
      await queryRunner.dropColumn('work_orders', 'visit_id');
    }
  }
}
