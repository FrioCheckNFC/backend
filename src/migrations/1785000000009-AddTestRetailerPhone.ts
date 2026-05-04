import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestRetailerPhone1785000000009 implements MigrationInterface {
    name = 'AddTestRetailerPhone1785000000009';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE users 
            SET phone = '+56912345678'
            WHERE phone IS NULL 
              OR phone = ''
        `);

        await queryRunner.query(`
            UPDATE stores s
            SET 
                retailer_phone = COALESCE(s.retailer_phone, u.phone),
                retailer_email = COALESCE(s.retailer_email, u.email)
            FROM users u
            WHERE s.retailer_id = u.id
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}