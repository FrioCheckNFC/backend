import { MigrationInterface, QueryRunner } from "typeorm";

export class PopulateRetailerContact1785000000008 implements MigrationInterface {
    name = 'PopulateRetailerContact1785000000008';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Poblar retailer_phone y retailer_email en stores desde users donde retailer_id match
        await queryRunner.query(`
            UPDATE stores s
            SET 
                retailer_phone = u.phone,
                retailer_email = u.email
            FROM users u
            WHERE s.retailer_id = u.id
              AND (s.retailer_phone IS NULL OR s.retailer_email IS NULL)
        `);

        // Para retailers que no tienen phone en users, poblar con datos de contacto del store
        await queryRunner.query(`
            UPDATE stores s
            SET retailer_phone = s.retailer_phone
            WHERE s.retailer_phone IS NULL 
              AND s.retailer_id IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No hay rollback para datos
    }
}