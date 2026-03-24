import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTagModelToNfcTags1710955005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('nfc_tags');
    
    if (!table) return;

    // Verificar si la columna ya existe
    const hasColumn = table.findColumnByName('tag_model');
    if (hasColumn) return;

    await queryRunner.addColumn(
      'nfc_tags',
      new TableColumn({
        name: 'tag_model',
        type: 'varchar',
        length: '20',
        default: "'NTAG-215'",
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('nfc_tags');
    
    if (!table) return;

    const hasColumn = table.findColumnByName('tag_model');
    if (!hasColumn) return;

    await queryRunner.dropColumn('nfc_tags', 'tag_model');
  }
}
