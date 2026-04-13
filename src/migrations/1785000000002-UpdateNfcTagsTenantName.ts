import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateNfcTagsTenantName1785000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'nfc_tags',
      new TableColumn({
        name: 'tenant_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.dropColumn('nfc_tags', 'tenant_id_obfuscated');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'nfc_tags',
      new TableColumn({
        name: 'tenant_id_obfuscated',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.dropColumn('nfc_tags', 'tenant_name');
  }
}
