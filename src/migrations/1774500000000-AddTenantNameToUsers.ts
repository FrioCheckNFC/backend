import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantNameToUsers1774500000000 implements MigrationInterface {
  name = 'AddTenantNameToUsers1774500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columna tenant_name
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_name VARCHAR(255)
    `);

    // 2. Poblar datos existentes
    await queryRunner.query(`
      UPDATE users u 
      SET tenant_name = t.name 
      FROM tenants t 
      WHERE u.tenant_id = t.id
    `);

    // 3. Crear función para sincronizar tenant_name
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sync_user_tenant_name()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Cuando se inserta o actualiza un usuario
        IF TG_TABLE_NAME = 'users' THEN
          SELECT name INTO NEW.tenant_name 
          FROM tenants 
          WHERE id = NEW.tenant_id;
          RETURN NEW;
        END IF;
        
        -- Cuando se actualiza el nombre de un tenant
        IF TG_TABLE_NAME = 'tenants' THEN
          UPDATE users 
          SET tenant_name = NEW.name 
          WHERE tenant_id = NEW.id;
          RETURN NEW;
        END IF;
        
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 4. Trigger para usuarios (INSERT/UPDATE)
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_sync_user_tenant_name ON users;
      CREATE TRIGGER trg_sync_user_tenant_name
      BEFORE INSERT OR UPDATE OF tenant_id ON users
      FOR EACH ROW
      EXECUTE FUNCTION sync_user_tenant_name();
    `);

    // 5. Trigger para tenants (UPDATE nombre)
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_sync_tenant_name_to_users ON tenants;
      CREATE TRIGGER trg_sync_tenant_name_to_users
      AFTER UPDATE OF name ON tenants
      FOR EACH ROW
      EXECUTE FUNCTION sync_user_tenant_name();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_sync_user_tenant_name ON users`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_sync_tenant_name_to_users ON tenants`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS sync_user_tenant_name`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS tenant_name`);
  }
}
