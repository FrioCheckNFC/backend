import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class EnhanceSectorsSchema1775848768822 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("sectors", [
            new TableColumn({
                name: "comuna",
                type: "varchar",
                isNullable: true,
            }),
            new TableColumn({
                name: "city",
                type: "varchar",
                isNullable: true,
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("sectors", "city");
        await queryRunner.dropColumn("sectors", "comuna");
    }

}
