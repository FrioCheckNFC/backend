import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBrandToMachines1678879400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'machines',
      new TableColumn({
        name: 'brand',
        type: 'varchar',
        length: '100',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('machines', 'brand');
  }
}
