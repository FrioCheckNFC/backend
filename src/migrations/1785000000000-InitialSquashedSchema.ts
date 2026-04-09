import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSquashedSchema1785000000000 implements MigrationInterface {
  name = 'InitialSquashedSchema1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Azure Postgres 17 uses built-in gen_random_uuid() instead of uuid-ossp extension

    // --- TENANTS ---
    await queryRunner.createTable(new Table({
      name: 'tenants',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
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
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
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
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'assigned_user_id', type: 'uuid', isNullable: true },
        { name: 'serial_number', type: 'varchar', length: '255', isNullable: true, isUnique: true },
        { name: 'model', type: 'varchar', length: '255', isNullable: true },
        { name: 'brand', type: 'varchar', length: '255', isNullable: true },
        { name: 'location_name', type: 'varchar', length: '255', isNullable: true },
        { name: 'location_lat', type: 'float', isNullable: true },
        { name: 'location_lng', type: 'float', isNullable: true },
        { name: 'status', type: 'varchar', length: '50', default: "'OPERATIVE'", isNullable: true },
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
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
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

    // --- SECTORS ---
    await queryRunner.createTable(new Table({
      name: 'sectors',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'name', type: 'varchar', isNullable: false },
        { name: 'description', type: 'varchar', isNullable: true },
        { name: 'address', type: 'varchar', isNullable: true },
        { name: 'latitude', type: 'decimal', precision: 10, scale: 8, isNullable: true },
        { name: 'longitude', type: 'decimal', precision: 11, scale: 8, isNullable: true },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    // --- NFC_TAGS ---
    await queryRunner.createTable(new Table({
      name: 'nfc_tags',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'machine_id', type: 'uuid', isNullable: false },
        { name: 'uid', type: 'varchar', length: '50', isUnique: true },
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
