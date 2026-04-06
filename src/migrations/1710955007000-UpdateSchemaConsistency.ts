import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateSchemaConsistency1710955007000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Rename 'active' to 'isActive' in tenants table
    const tenantTable = await queryRunner.getTable('tenants');
    if (tenantTable?.findColumnByName('active')) {
      await queryRunner.renameColumn('tenants', 'active', 'is_active');
    }

    // 2. Add 'logoUrl' column to tenants table
    if (tenantTable && !tenantTable.findColumnByName('logo_url')) {
      await queryRunner.addColumn(
        'tenants',
        new TableColumn({
          name: 'logo_url',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    // 3. Add 'validationNotes' to visits table
    const visitsTable = await queryRunner.getTable('visits');
    if (visitsTable && !visitsTable.findColumnByName('validation_notes')) {
      await queryRunner.addColumn(
        'visits',
        new TableColumn({
          name: 'validation_notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 4. Make 'machine_id' nullable in tickets table
    const ticketsTable = await queryRunner.getTable('tickets');
    if (ticketsTable) {
      const machineIdColumn = ticketsTable.findColumnByName('machine_id');
      if (machineIdColumn && !machineIdColumn.isNullable) {
        await queryRunner.changeColumn(
          'tickets',
          'machine_id',
          new TableColumn({
            name: 'machine_id',
            type: 'uuid',
            isNullable: true,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse: rename 'isActive' back to 'active' in tenants
    const tenantTable = await queryRunner.getTable('tenants');
    if (tenantTable?.findColumnByName('is_active')) {
      await queryRunner.renameColumn('tenants', 'is_active', 'active');
    }

    // Remove 'logoUrl' column from tenants
    if (tenantTable?.findColumnByName('logo_url')) {
      await queryRunner.dropColumn('tenants', 'logo_url');
    }

    // Remove 'validationNotes' from visits
    const visitsTable = await queryRunner.getTable('visits');
    if (visitsTable?.findColumnByName('validation_notes')) {
      await queryRunner.dropColumn('visits', 'validation_notes');
    }

    // Make 'machine_id' non-nullable in tickets
    const ticketsTable = await queryRunner.getTable('tickets');
    if (ticketsTable?.findColumnByName('machine_id')) {
      await queryRunner.changeColumn(
        'tickets',
        'machine_id',
        new TableColumn({
          name: 'machine_id',
          type: 'uuid',
          isNullable: false,
        }),
      );
    }
  }
}
