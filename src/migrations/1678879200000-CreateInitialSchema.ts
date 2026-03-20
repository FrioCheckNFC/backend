import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class CreateInitialSchema1678879200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear extensión UUID si no existe
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Crear tabla tenants
    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Crear tabla users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'first_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['ADMIN', 'SUPPORT', 'VENDOR', 'RETAILER', 'TECHNICIAN', 'DRIVER'],
            isNullable: false,
          },
          {
            name: 'fcm_tokens',
            type: 'text',
            isNullable: true,
            comment: 'JSON array of FCM token strings',
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // FK: users.tenant_id -> tenants.id
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Crear tabla machines
    await queryRunner.createTable(
      new Table({
        name: 'machines',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'serial_number',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'model',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['DISPONIBLE', 'EN_USO', 'EN_MANTENIMIENTO', 'EN_RETIRO'],
            default: "'DISPONIBLE'",
          },
          {
            name: 'assigned_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'location_lat',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'location_lng',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // FK: machines.tenant_id -> tenants.id
    await queryRunner.createForeignKey(
      'machines',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // FK: machines.assigned_user_id -> users.id
    await queryRunner.createForeignKey(
      'machines',
      new TableForeignKey({
        columnNames: ['assigned_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Crear índice único: tenant_id + serial_number
    await queryRunner.createIndex(
      'machines',
      new TableIndex({
        columnNames: ['tenant_id', 'serial_number'],
        isUnique: true,
      }),
    );

    // Crear tabla nfc_tags
    await queryRunner.createTable(
      new Table({
        name: 'nfc_tags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'machine_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'uid',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'hardware_model',
            type: 'varchar',
            default: "'NTAG215'",
          },
          {
            name: 'machine_serial_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'tenant_id_obfuscated',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'integrity_checksum',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'is_locked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // FK: nfc_tags.tenant_id -> tenants.id
    await queryRunner.createForeignKey(
      'nfc_tags',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // FK: nfc_tags.machine_id -> machines.id
    await queryRunner.createForeignKey(
      'nfc_tags',
      new TableForeignKey({
        columnNames: ['machine_id'],
        referencedTableName: 'machines',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Crear tabla visits
    await queryRunner.createTable(
      new Table({
        name: 'visits',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'machine_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'check_in_timestamp',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'check_out_timestamp',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'check_in_nfc_uid',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'check_out_nfc_uid',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'check_in_gps_lat',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'check_in_gps_lng',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'check_out_gps_lat',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'check_out_gps_lng',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ABIERTA', 'CERRADA', 'ANULADA'],
            default: "'ABIERTA'",
          },
          {
            name: 'is_valid',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // FKs para visits
    await queryRunner.createForeignKey(
      'visits',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'visits',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'visits',
      new TableForeignKey({
        columnNames: ['machine_id'],
        referencedTableName: 'machines',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Crear tabla work_orders
    await queryRunner.createTable(
      new Table({
        name: 'work_orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'machine_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'assigned_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'visit_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['ENTREGA', 'REPOSICION', 'RETIRO', 'REPARACION'],
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDIENTE', 'EN_TRANSITO', 'ENTREGADO', 'RECHAZADO', 'CANCELADO'],
            default: "'PENDIENTE'",
          },
          {
            name: 'expected_nfc_uid',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'actual_nfc_uid',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'nfc_validated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'expected_location_lat',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'expected_location_lng',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'actual_location_lat',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'actual_location_lng',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'signature_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // FKs para work_orders
    await queryRunner.createForeignKey(
      'work_orders',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'work_orders',
      new TableForeignKey({
        columnNames: ['machine_id'],
        referencedTableName: 'machines',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'work_orders',
      new TableForeignKey({
        columnNames: ['assigned_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'work_orders',
      new TableForeignKey({
        columnNames: ['visit_id'],
        referencedTableName: 'visits',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Crear tabla tickets
    await queryRunner.createTable(
      new Table({
        name: 'tickets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_by_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'resolved_by_user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'machine_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'manual_machine_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'machine_photo_plate_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['FALLA', 'MANTENIMIENTO', 'CONSULTA', 'OTRO'],
            isNullable: false,
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'],
            default: "'MEDIA'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'],
            default: "'ABIERTO'",
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'resolution_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sla_hours',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'resolved_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // FKs para tickets
    await queryRunner.createForeignKey(
      'tickets',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'tickets',
      new TableForeignKey({
        columnNames: ['created_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'tickets',
      new TableForeignKey({
        columnNames: ['resolved_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'tickets',
      new TableForeignKey({
        columnNames: ['machine_id'],
        referencedTableName: 'machines',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Crear tabla attachments
    await queryRunner.createTable(
      new Table({
        name: 'attachments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'visit_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'work_order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'ticket_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'file_url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_size',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['FOTO', 'DOCUMENTO', 'FIRMA', 'VIDEO'],
            isNullable: false,
          },
          {
            name: 'category',
            type: 'enum',
            enum: ['COMPROBANTE', 'EVIDENCIA', 'SOPORTE', 'OTRO'],
            default: "'OTRO'",
          },
          {
            name: 'uploaded_by_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // FKs para attachments
    await queryRunner.createForeignKey(
      'attachments',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'attachments',
      new TableForeignKey({
        columnNames: ['visit_id'],
        referencedTableName: 'visits',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'attachments',
      new TableForeignKey({
        columnNames: ['work_order_id'],
        referencedTableName: 'work_orders',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'attachments',
      new TableForeignKey({
        columnNames: ['ticket_id'],
        referencedTableName: 'tickets',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'attachments',
      new TableForeignKey({
        columnNames: ['uploaded_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Crear tabla sync_queue
    await queryRunner.createTable(
      new Table({
        name: 'sync_queue',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'operation_type',
            type: 'enum',
            enum: ['CREATE', 'UPDATE', 'DELETE'],
            isNullable: false,
          },
          {
            name: 'entity_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'payload',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDIENTE', 'SINCRONIZADO', 'FALLIDO', 'REVISION_MANUAL'],
            default: "'PENDIENTE'",
          },
          {
            name: 'retry_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'last_error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'synced_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // FK para sync_queue
    await queryRunner.createForeignKey(
      'sync_queue',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    console.log('✅ Initial schema created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting FKs)
    await queryRunner.dropTable('sync_queue', true);
    await queryRunner.dropTable('attachments', true);
    await queryRunner.dropTable('tickets', true);
    await queryRunner.dropTable('work_orders', true);
    await queryRunner.dropTable('visits', true);
    await queryRunner.dropTable('nfc_tags', true);
    await queryRunner.dropTable('machines', true);
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('tenants', true);

    console.log('✅ Schema rolled back successfully');
  }
}
