import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSquashedSchema1785000000000 implements MigrationInterface {
  name = 'InitialSquashedSchema1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // --- TENANTS ---
    await queryRunner.createTable(new Table({
      name: 'tenants',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'name', type: 'varchar', length: '255', isNullable: false },
        { name: 'slug', type: 'varchar', length: '255', isNullable: false, isUnique: true },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'logo_url', type: 'varchar', isNullable: true },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    // --- USERS ---
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: true },
        { name: 'email', type: 'varchar', length: '255', isNullable: false, isUnique: true },
        { name: 'rut', type: 'varchar', length: '12', isNullable: true, isUnique: true },
        { name: 'password_hash', type: 'varchar', length: '255', isNullable: false },
        { name: 'first_name', type: 'varchar', length: '255', isNullable: false },
        { name: 'last_name', type: 'varchar', length: '255', isNullable: false },
        { name: 'phone', type: 'varchar', length: '20', isNullable: true },
        { name: 'role', type: 'text', isArray: true, default: "'{TECHNICIAN}'", isNullable: false },
        { name: 'tenant_name', type: 'varchar', length: '255', isNullable: true },
        { name: 'fcm_tokens', type: 'text', isNullable: true },
        { name: 'active', type: 'boolean', default: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('users', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));

    // --- MACHINES ---
    await queryRunner.createTable(new Table({
      name: 'machines',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'assigned_user_id', type: 'uuid', isNullable: true },
        { name: 'serial_number', type: 'varchar', length: '255', isNullable: true, isUnique: true },
        { name: 'model', type: 'varchar', length: '255', isNullable: true },
        { name: 'brand', type: 'varchar', length: '255', isNullable: true },
        { name: 'location_name', type: 'varchar', length: '255', isNullable: true },
        { name: 'location_lat', type: 'float', isNullable: true },
        { name: 'location_lng', type: 'float', isNullable: true },
        { name: 'status', type: 'varchar', length: '50', default: "'OPERATIVE'" },
        { name: 'nfc_tag_id', type: 'varchar', length: '255', isUnique: true, isNullable: true },
        { name: 'nfc_code', type: 'varchar', length: '255', isNullable: true },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    // --- VISITS ---
    await queryRunner.createTable(new Table({
      name: 'visits',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'technician_id', type: 'uuid', isNullable: false },
        { name: 'machine_id', type: 'uuid', isNullable: false },
        { name: 'latitude', type: 'float', isNullable: true },
        { name: 'longitude', type: 'float', isNullable: true },
        { name: 'nfc_tag_id', type: 'varchar', length: '255', isNullable: true },
        { name: 'temperature', type: 'decimal', precision: 5, scale: 2, isNullable: true },
        { name: 'notes', type: 'text', isNullable: true },
        { name: 'status', type: 'varchar', default: "'completed'" },
        { name: 'type', type: 'varchar', length: '50', isNullable: true },
        { name: 'visited_at', type: 'timestamptz', isNullable: false },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('visits', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('visits', new TableForeignKey({ columnNames: ['technician_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));

    // --- SYNC_QUEUE ---
    await queryRunner.createTable(new Table({
      name: 'sync_queue',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'user_id', type: 'uuid', isNullable: false },
        { name: 'operation_type', type: 'varchar', length: '50', isNullable: false },
        { name: 'status', type: 'varchar', length: '50', default: "'PENDIENTE'" },
        { name: 'payload', type: 'json', isNullable: false },
        { name: 'retry_count', type: 'int', default: 0 },
        { name: 'max_retries', type: 'int', default: 3 },
        { name: 'error_message', type: 'text', isNullable: true },
        { name: 'error_stack', type: 'text', isNullable: true },
        { name: 'next_retry_at', type: 'timestamp', isNullable: true },
        { name: 'synced_at', type: 'timestamp', isNullable: true },
        { name: 'entity_id', type: 'uuid', isNullable: true },
        { name: 'entity_type', type: 'varchar', length: '50', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    // --- SECTORS ---
    await queryRunner.createTable(new Table({
      name: 'sectors',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'name', type: 'varchar', isNullable: false },
        { name: 'description', type: 'varchar', isNullable: true },
        { name: 'address', type: 'varchar', isNullable: true },
        { name: 'location_lat', type: 'decimal', precision: 10, scale: 8, isNullable: true },
        { name: 'location_lng', type: 'decimal', precision: 11, scale: 8, isNullable: true },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    // --- WORK_ORDERS ---
    await queryRunner.createTable(new Table({
      name: 'work_orders',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'created_by_id', type: 'uuid', isNullable: false },
        { name: 'assigned_to_id', type: 'uuid', isNullable: true },
        { name: 'machine_id', type: 'uuid', isNullable: true },
        { name: 'title', type: 'varchar', isNullable: false },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'status', type: 'varchar', default: "'pending'" },
        { name: 'priority', type: 'varchar', default: "'medium'" },
        { name: 'due_date', type: 'timestamp', isNullable: true },
        { name: 'completed_at', type: 'timestamp', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    // --- NFC_TAGS ---
    await queryRunner.createTable(new Table({
      name: 'nfc_tags',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'machine_id', type: 'uuid', isNullable: false },
        { name: 'uid', type: 'varchar', length: '14', isUnique: true },
        { name: 'tag_model', type: 'varchar', default: "'NTAG-215'" },
        { name: 'hardware_model', type: 'varchar', default: "'NTAG215'" },
        { name: 'machine_serial_id', type: 'varchar', isNullable: false },
        { name: 'tenant_id_obfuscated', type: 'varchar', isNullable: false },
        { name: 'integrity_checksum', type: 'varchar', isNullable: false },
        { name: 'is_locked', type: 'boolean', default: false },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    // --- TRIGGERS ---
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sync_user_tenant_name()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_TABLE_NAME = 'users' THEN
          SELECT name INTO NEW.tenant_name FROM tenants WHERE id = NEW.tenant_id;
          RETURN NEW;
        END IF;
        IF TG_TABLE_NAME = 'tenants' THEN
          UPDATE users SET tenant_name = NEW.name WHERE tenant_id = NEW.id;
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_sync_user_tenant_name ON users;
      CREATE TRIGGER trg_sync_user_tenant_name
      BEFORE INSERT OR UPDATE OF tenant_id ON users
      FOR EACH ROW EXECUTE FUNCTION sync_user_tenant_name();
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_sync_tenant_name_to_users ON tenants;
      CREATE TRIGGER trg_sync_tenant_name_to_users
      AFTER UPDATE OF name ON tenants
      FOR EACH ROW EXECUTE FUNCTION sync_user_tenant_name();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No es necesario para squash inicial
  }
}
