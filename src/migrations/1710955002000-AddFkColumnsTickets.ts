import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFkColumnsTickets1710955002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('tickets');
    if (!table) return;

    // Add tenant_id if it doesn't exist
    if (!table.findColumnByName('tenant_id')) {
      await queryRunner.addColumn(
        'tickets',
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
        'tickets',
        new TableColumn({
          name: 'machine_id',
          type: 'uuid',
          isNullable: false,
        }),
      );
    }

    // Add reported_by_id if it doesn't exist
    if (!table.findColumnByName('reported_by_id')) {
      await queryRunner.addColumn(
        'tickets',
        new TableColumn({
          name: 'reported_by_id',
          type: 'uuid',
          isNullable: false,
        }),
      );
    }

    // Add assigned_to_id if it doesn't exist
    if (!table.findColumnByName('assigned_to_id')) {
      await queryRunner.addColumn(
        'tickets',
        new TableColumn({
          name: 'assigned_to_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('tickets');
    if (!table) return;

    if (table.findColumnByName('tenant_id')) {
      await queryRunner.dropColumn('tickets', 'tenant_id');
    }
    if (table.findColumnByName('machine_id')) {
      await queryRunner.dropColumn('tickets', 'machine_id');
    }
    if (table.findColumnByName('reported_by_id')) {
      await queryRunner.dropColumn('tickets', 'reported_by_id');
    }
    if (table.findColumnByName('assigned_to_id')) {
      await queryRunner.dropColumn('tickets', 'assigned_to_id');
    }
  }
}
