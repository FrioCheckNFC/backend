import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersView1774500000000 implements MigrationInterface {
  name = 'CreateUsersView1774500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE VIEW users_view AS
      SELECT 
        u.id,
        u.tenant_id,
        t.name AS tenant_name,
        t.slug AS tenant_slug,
        u.email,
        u.rut,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.phone,
        u.role,
        u.active,
        u.created_at,
        u.updated_at,
        u.deleted_at
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.deleted_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS users_view`);
  }
}
