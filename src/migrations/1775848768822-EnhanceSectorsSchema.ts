import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class EnhanceSectorsSchema1775848768822 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Añadir nuevas columnas
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

        // Eliminar columnas obsoletas
        await queryRunner.dropColumn("sectors", "name");
        await queryRunner.dropColumn("sectors", "description");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaurar columnas obsoletas
        await queryRunner.addColumns("sectors", [
            new TableColumn({
                name: "name",
                type: "varchar",
                isNullable: true,
            }),
            new TableColumn({
                name: "description",
                type: "varchar",
                isNullable: true,
            })
        ]);

        // Eliminar nuevas columnas
        await queryRunner.dropColumn("sectors", "city");
        await queryRunner.dropColumn("sectors", "comuna");
    }

}
