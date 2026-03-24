import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFkColumnsAttachments1710955001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('attachments');
    if (!table) return;

    // Add tenant_id if it doesn't exist
    if (!table.findColumnByName('tenant_id')) {
      await queryRunner.addColumn(
        'attachments',
        new TableColumn({
          name: 'tenant_id',
          type: 'uuid',
          isNullable: false,
        }),
      );
    }

    // Add uploaded_by_id if it doesn't exist
    if (!table.findColumnByName('uploaded_by_id')) {
      await queryRunner.addColumn(
        'attachments',
        new TableColumn({
          name: 'uploaded_by_id',
          type: 'uuid',
          isNullable: false,
        }),
      );
    }

    // Add visit_id if it doesn't exist
    if (!table.findColumnByName('visit_id')) {
      await queryRunner.addColumn(
        'attachments',
        new TableColumn({
          name: 'visit_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // Add work_order_id if it doesn't exist
    if (!table.findColumnByName('work_order_id')) {
      await queryRunner.addColumn(
        'attachments',
        new TableColumn({
          name: 'work_order_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // Add ticket_id if it doesn't exist
    if (!table.findColumnByName('ticket_id')) {
      await queryRunner.addColumn(
        'attachments',
        new TableColumn({
          name: 'ticket_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('attachments');
    if (!table) return;

    if (table.findColumnByName('tenant_id')) {
      await queryRunner.dropColumn('attachments', 'tenant_id');
    }
    if (table.findColumnByName('uploaded_by_id')) {
      await queryRunner.dropColumn('attachments', 'uploaded_by_id');
    }
    if (table.findColumnByName('visit_id')) {
      await queryRunner.dropColumn('attachments', 'visit_id');
    }
    if (table.findColumnByName('work_order_id')) {
      await queryRunner.dropColumn('attachments', 'work_order_id');
    }
    if (table.findColumnByName('ticket_id')) {
      await queryRunner.dropColumn('attachments', 'ticket_id');
    }
  }
}
