import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFkColumnsMachines1710955004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('machines');
    if (!table) return;

    // Add tenant_id if it doesn't exist
    if (!table.findColumnByName('tenant_id')) {
      await queryRunner.addColumn(
        'machines',
        new TableColumn({
          name: 'tenant_id',
          type: 'uuid',
          isNullable: false,
        }),
      );
    }

    // Add assigned_user_id if it doesn't exist
    if (!table.findColumnByName('assigned_user_id')) {
      await queryRunner.addColumn(
        'machines',
        new TableColumn({
          name: 'assigned_user_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('machines');
    if (!table) return;

    if (table.findColumnByName('tenant_id')) {
      await queryRunner.dropColumn('machines', 'tenant_id');
    }
    if (table.findColumnByName('assigned_user_id')) {
      await queryRunner.dropColumn('machines', 'assigned_user_id');
    }
  }
}
