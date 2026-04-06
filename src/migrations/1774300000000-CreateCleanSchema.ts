import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCleanSchema1774300000000 implements MigrationInterface {
  name = 'CreateCleanSchema1774300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // TENANTS
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

    // USERS
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
        { name: 'role', type: 'enum', enum: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'VENDOR', 'RETAILER', 'TECHNICIAN', 'DRIVER'], enumName: 'users_role_enum', isNullable: false },
        { name: 'fcm_tokens', type: 'text', isNullable: true },
        { name: 'active', type: 'boolean', default: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('users', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['tenant_id'] }));

    // MACHINES
    await queryRunner.createTable(new Table({
      name: 'machines',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'assigned_user_id', type: 'uuid', isNullable: true },
        { name: 'serial_number', type: 'varchar', length: '100', isNullable: false, isUnique: true },
        { name: 'model', type: 'varchar', length: '100', isNullable: false },
        { name: 'brand', type: 'varchar', length: '100', isNullable: true },
        { name: 'location_name', type: 'varchar', length: '200', isNullable: true },
        { name: 'location_lat', type: 'decimal', precision: 10, scale: 8, isNullable: true },
        { name: 'location_lng', type: 'decimal', precision: 11, scale: 8, isNullable: true },
        { name: 'status', type: 'enum', enum: ['ACTIVE', 'INACTIVE', 'IN_TRANSIT', 'MAINTENANCE', 'DECOMMISSIONED'], enumName: 'machines_status_enum', default: "'ACTIVE'", isNullable: false },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('machines', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('machines', new TableForeignKey({ columnNames: ['assigned_user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createIndex('machines', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('machines', new TableIndex({ columnNames: ['assigned_user_id'] }));

    // NFC_TAGS
    await queryRunner.createTable(new Table({
      name: 'nfc_tags',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'machine_id', type: 'uuid', isNullable: false },
        { name: 'uid', type: 'varchar', length: '20', isNullable: false, isUnique: true },
        { name: 'tag_model', type: 'varchar', length: '20', default: "'NTAG-215'" },
        { name: 'hardware_model', type: 'varchar', length: '20', default: "'NTAG215'" },
        { name: 'machine_serial_id', type: 'varchar', length: '255', isNullable: false },
        { name: 'tenant_id_obfuscated', type: 'varchar', length: '255', isNullable: false },
        { name: 'integrity_checksum', type: 'varchar', length: '255', isNullable: false },
        { name: 'is_locked', type: 'boolean', default: false },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('nfc_tags', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('nfc_tags', new TableForeignKey({ columnNames: ['machine_id'], referencedTableName: 'machines', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createIndex('nfc_tags', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('nfc_tags', new TableIndex({ columnNames: ['machine_id'] }));

    // VISITS
    await queryRunner.createTable(new Table({
      name: 'visits',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'user_id', type: 'uuid', isNullable: false },
        { name: 'machine_id', type: 'uuid', isNullable: false },
        { name: 'check_in_timestamp', type: 'timestamp', isNullable: false },
        { name: 'check_out_timestamp', type: 'timestamp', isNullable: true },
        { name: 'check_in_nfc_uid', type: 'varchar', length: '20', isNullable: false },
        { name: 'check_out_nfc_uid', type: 'varchar', length: '20', isNullable: true },
        { name: 'check_in_gps_lat', type: 'decimal', precision: 10, scale: 8, isNullable: false },
        { name: 'check_in_gps_lng', type: 'decimal', precision: 11, scale: 8, isNullable: false },
        { name: 'check_out_gps_lat', type: 'decimal', precision: 10, scale: 8, isNullable: true },
        { name: 'check_out_gps_lng', type: 'decimal', precision: 11, scale: 8, isNullable: true },
        { name: 'status', type: 'enum', enum: ['ABIERTA', 'CERRADA', 'ANULADA'], enumName: 'visits_status_enum', default: "'ABIERTA'", isNullable: false },
        { name: 'is_valid', type: 'boolean', default: true },
        { name: 'validation_notes', type: 'text', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('visits', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('visits', new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }));
    await queryRunner.createForeignKey('visits', new TableForeignKey({ columnNames: ['machine_id'], referencedTableName: 'machines', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }));
    await queryRunner.createIndex('visits', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('visits', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('visits', new TableIndex({ columnNames: ['machine_id'] }));
    await queryRunner.createIndex('visits', new TableIndex({ columnNames: ['status'] }));

    // WORK_ORDERS
    await queryRunner.createTable(new Table({
      name: 'work_orders',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'machine_id', type: 'uuid', isNullable: false },
        { name: 'assigned_user_id', type: 'uuid', isNullable: false },
        { name: 'visit_id', type: 'uuid', isNullable: true },
        { name: 'type', type: 'enum', enum: ['entrega', 'reposicion', 'retiro', 'reparacion'], enumName: 'work_orders_type_enum', default: "'entrega'", isNullable: false },
        { name: 'status', type: 'enum', enum: ['pendiente', 'en_transito', 'entregado', 'rechazado', 'cancelado'], enumName: 'work_orders_status_enum', default: "'pendiente'", isNullable: false },
        { name: 'expected_nfc_uid', type: 'varchar', length: '20', isNullable: false },
        { name: 'actual_nfc_uid', type: 'varchar', length: '20', isNullable: true },
        { name: 'nfc_validated', type: 'boolean', default: false },
        { name: 'expected_location_lat', type: 'decimal', precision: 10, scale: 8, isNullable: false },
        { name: 'expected_location_lng', type: 'decimal', precision: 11, scale: 8, isNullable: false },
        { name: 'actual_location_lat', type: 'decimal', precision: 10, scale: 8, isNullable: true },
        { name: 'actual_location_lng', type: 'decimal', precision: 11, scale: 8, isNullable: true },
        { name: 'estimated_delivery_date', type: 'timestamp', isNullable: false },
        { name: 'delivery_date', type: 'timestamp', isNullable: true },
        { name: 'description', type: 'varchar', length: '500', isNullable: true },
        { name: 'rejection_reason', type: 'varchar', length: '500', isNullable: true },
        { name: 'signed_by', type: 'varchar', length: '100', isNullable: true },
        { name: 'signature_url', type: 'varchar', length: '500', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('work_orders', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('work_orders', new TableForeignKey({ columnNames: ['machine_id'], referencedTableName: 'machines', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }));
    await queryRunner.createForeignKey('work_orders', new TableForeignKey({ columnNames: ['assigned_user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }));
    await queryRunner.createForeignKey('work_orders', new TableForeignKey({ columnNames: ['visit_id'], referencedTableName: 'visits', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createIndex('work_orders', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('work_orders', new TableIndex({ columnNames: ['machine_id'] }));
    await queryRunner.createIndex('work_orders', new TableIndex({ columnNames: ['assigned_user_id'] }));
    await queryRunner.createIndex('work_orders', new TableIndex({ columnNames: ['visit_id'] }));
    await queryRunner.createIndex('work_orders', new TableIndex({ columnNames: ['status'] }));

    // TICKETS
    await queryRunner.createTable(new Table({
      name: 'tickets',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'machine_id', type: 'uuid', isNullable: true },
        { name: 'reported_by_id', type: 'uuid', isNullable: false },
        { name: 'assigned_to_id', type: 'uuid', isNullable: true },
        { name: 'resolved_by_id', type: 'uuid', isNullable: true },
        { name: 'type', type: 'enum', enum: ['falla', 'merma', 'error_nfc', 'mantenimiento', 'otro'], enumName: 'tickets_type_enum', isNullable: false },
        { name: 'priority', type: 'enum', enum: ['baja', 'media', 'alta', 'critica'], enumName: 'tickets_priority_enum', default: "'media'", isNullable: false },
        { name: 'status', type: 'enum', enum: ['abierto', 'en_progreso', 'resuelto', 'cerrado'], enumName: 'tickets_status_enum', default: "'abierto'", isNullable: false },
        { name: 'title', type: 'varchar', length: '200', isNullable: false },
        { name: 'description', type: 'text', isNullable: false },
        { name: 'can_use_manual_entry', type: 'boolean', default: true },
        { name: 'manual_machine_id', type: 'varchar', length: '100', isNullable: true },
        { name: 'machine_photo_plate_url', type: 'varchar', length: '500', isNullable: true },
        { name: 'resolution_notes', type: 'text', isNullable: true },
        { name: 'resolved_at', type: 'timestamp', isNullable: true },
        { name: 'due_date', type: 'timestamp', isNullable: true },
        { name: 'time_spent_minutes', type: 'integer', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('tickets', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('tickets', new TableForeignKey({ columnNames: ['machine_id'], referencedTableName: 'machines', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('tickets', new TableForeignKey({ columnNames: ['reported_by_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }));
    await queryRunner.createForeignKey('tickets', new TableForeignKey({ columnNames: ['assigned_to_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('tickets', new TableForeignKey({ columnNames: ['resolved_by_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createIndex('tickets', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('tickets', new TableIndex({ columnNames: ['reported_by_id'] }));
    await queryRunner.createIndex('tickets', new TableIndex({ columnNames: ['assigned_to_id'] }));
    await queryRunner.createIndex('tickets', new TableIndex({ columnNames: ['machine_id'] }));
    await queryRunner.createIndex('tickets', new TableIndex({ columnNames: ['priority'] }));
    await queryRunner.createIndex('tickets', new TableIndex({ columnNames: ['status'] }));

    // ATTACHMENTS
    await queryRunner.createTable(new Table({
      name: 'attachments',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'uploaded_by_id', type: 'uuid', isNullable: false },
        { name: 'visit_id', type: 'uuid', isNullable: true },
        { name: 'work_order_id', type: 'uuid', isNullable: true },
        { name: 'ticket_id', type: 'uuid', isNullable: true },
        { name: 'type', type: 'enum', enum: ['foto', 'documento', 'firma', 'video'], enumName: 'attachments_type_enum', default: "'foto'", isNullable: false },
        { name: 'category', type: 'enum', enum: ['evidencia', 'antes_despues', 'daños', 'placa_maquina', 'confirmacion'], enumName: 'attachments_category_enum', isNullable: false },
        { name: 'file_name', type: 'varchar', length: '255', isNullable: false },
        { name: 'file_size_bytes', type: 'integer', isNullable: false },
        { name: 'mime_type', type: 'varchar', length: '100', isNullable: false },
        { name: 'azure_blob_url', type: 'varchar', length: '500', isNullable: false },
        { name: 'description', type: 'varchar', length: '500', isNullable: true },
        { name: 'metadata', type: 'json', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('attachments', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('attachments', new TableForeignKey({ columnNames: ['uploaded_by_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('attachments', new TableForeignKey({ columnNames: ['visit_id'], referencedTableName: 'visits', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('attachments', new TableForeignKey({ columnNames: ['work_order_id'], referencedTableName: 'work_orders', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('attachments', new TableForeignKey({ columnNames: ['ticket_id'], referencedTableName: 'tickets', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createIndex('attachments', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('attachments', new TableIndex({ columnNames: ['uploaded_by_id'] }));
    await queryRunner.createIndex('attachments', new TableIndex({ columnNames: ['visit_id'] }));
    await queryRunner.createIndex('attachments', new TableIndex({ columnNames: ['work_order_id'] }));
    await queryRunner.createIndex('attachments', new TableIndex({ columnNames: ['ticket_id'] }));

    // SYNC_QUEUE
    await queryRunner.createTable(new Table({
      name: 'sync_queue',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'user_id', type: 'uuid', isNullable: false },
        { name: 'operation_type', type: 'enum', enum: ['visit_check_in', 'visit_check_out', 'work_order_delivery', 'ticket_report', 'ticket_update', 'attachment_upload'], enumName: 'sync_queue_operation_type_enum', isNullable: false },
        { name: 'status', type: 'enum', enum: ['PENDIENTE', 'SINCRONIZADO', 'FALLIDO', 'REVISION_MANUAL'], enumName: 'sync_queue_status_enum', default: "'PENDIENTE'", isNullable: false },
        { name: 'entity_type', type: 'varchar', length: '50', isNullable: true },
        { name: 'entity_id', type: 'uuid', isNullable: true },
        { name: 'payload', type: 'json', isNullable: false },
        { name: 'retry_count', type: 'integer', default: 0 },
        { name: 'max_retries', type: 'integer', default: 3 },
        { name: 'error_message', type: 'text', isNullable: true },
        { name: 'error_stack', type: 'text', isNullable: true },
        { name: 'next_retry_at', type: 'timestamp', isNullable: true },
        { name: 'synced_at', type: 'timestamp', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('sync_queue', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('sync_queue', new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }));
    await queryRunner.createIndex('sync_queue', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('sync_queue', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('sync_queue', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('sync_queue', new TableIndex({ columnNames: ['entity_type'] }));
    await queryRunner.createIndex('sync_queue', new TableIndex({ columnNames: ['created_at'] }));

    // SECTORS
    await queryRunner.createTable(new Table({
      name: 'sectors',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'name', type: 'varchar', length: '100', isNullable: false },
        { name: 'description', type: 'varchar', length: '200', isNullable: true },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('sectors', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createIndex('sectors', new TableIndex({ columnNames: ['tenant_id'] }));

    // SALES
    await queryRunner.createTable(new Table({
      name: 'sales',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'vendor_id', type: 'uuid', isNullable: false },
        { name: 'sector_id', type: 'uuid', isNullable: true },
        { name: 'machine_id', type: 'uuid', isNullable: true },
        { name: 'amount', type: 'decimal', precision: 12, scale: 2, isNullable: false },
        { name: 'description', type: 'varchar', length: '200', isNullable: true },
        { name: 'sale_date', type: 'timestamp', isNullable: false },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('sales', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('sales', new TableForeignKey({ columnNames: ['vendor_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }));
    await queryRunner.createForeignKey('sales', new TableForeignKey({ columnNames: ['sector_id'], referencedTableName: 'sectors', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('sales', new TableForeignKey({ columnNames: ['machine_id'], referencedTableName: 'machines', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createIndex('sales', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('sales', new TableIndex({ columnNames: ['vendor_id'] }));
    await queryRunner.createIndex('sales', new TableIndex({ columnNames: ['sector_id'] }));
    await queryRunner.createIndex('sales', new TableIndex({ columnNames: ['sale_date'] }));

    // MERMAS
    await queryRunner.createTable(new Table({
      name: 'mermas',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'reported_by_id', type: 'uuid', isNullable: false },
        { name: 'ticket_id', type: 'uuid', isNullable: true },
        { name: 'machine_id', type: 'uuid', isNullable: true },
        { name: 'product_name', type: 'varchar', length: '200', isNullable: false },
        { name: 'quantity', type: 'decimal', precision: 10, scale: 2, isNullable: false },
        { name: 'unit_cost', type: 'decimal', precision: 12, scale: 2, isNullable: false },
        { name: 'total_cost', type: 'decimal', precision: 12, scale: 2, isNullable: false },
        { name: 'cause', type: 'text', isNullable: true },
        { name: 'merma_date', type: 'timestamp', isNullable: false },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('mermas', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('mermas', new TableForeignKey({ columnNames: ['reported_by_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }));
    await queryRunner.createForeignKey('mermas', new TableForeignKey({ columnNames: ['ticket_id'], referencedTableName: 'tickets', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('mermas', new TableForeignKey({ columnNames: ['machine_id'], referencedTableName: 'machines', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createIndex('mermas', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('mermas', new TableIndex({ columnNames: ['reported_by_id'] }));
    await queryRunner.createIndex('mermas', new TableIndex({ columnNames: ['ticket_id'] }));
    await queryRunner.createIndex('mermas', new TableIndex({ columnNames: ['merma_date'] }));

    // INVENTORY
    await queryRunner.createTable(new Table({
      name: 'inventory',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'part_name', type: 'varchar', length: '200', isNullable: false },
        { name: 'part_number', type: 'varchar', length: '100', isNullable: true },
        { name: 'description', type: 'varchar', length: '200', isNullable: true },
        { name: 'quantity', type: 'integer', default: 0 },
        { name: 'min_quantity', type: 'integer', default: 0 },
        { name: 'unit_cost', type: 'decimal', precision: 12, scale: 2, isNullable: true },
        { name: 'status', type: 'enum', enum: ['disponible', 'en_uso', 'agotado', 'en_pedido'], enumName: 'inventory_status_enum', default: "'disponible'", isNullable: false },
        { name: 'location', type: 'varchar', length: '200', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('inventory', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createIndex('inventory', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('inventory', new TableIndex({ columnNames: ['part_number'] }));
    await queryRunner.createIndex('inventory', new TableIndex({ columnNames: ['status'] }));

    // KPIS
    await queryRunner.createTable(new Table({
      name: 'kpis',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'tenant_id', type: 'uuid', isNullable: false },
        { name: 'user_id', type: 'uuid', isNullable: true },
        { name: 'sector_id', type: 'uuid', isNullable: true },
        { name: 'type', type: 'enum', enum: ['visitas', 'ventas', 'tickets', 'mermas'], enumName: 'kpis_type_enum', isNullable: false },
        { name: 'name', type: 'varchar', length: '200', isNullable: false },
        { name: 'target_value', type: 'decimal', precision: 12, scale: 2, isNullable: false },
        { name: 'current_value', type: 'decimal', precision: 12, scale: 2, default: 0 },
        { name: 'start_date', type: 'timestamp', isNullable: false },
        { name: 'end_date', type: 'timestamp', isNullable: false },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'deleted_at', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createForeignKey('kpis', new TableForeignKey({ columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('kpis', new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('kpis', new TableForeignKey({ columnNames: ['sector_id'], referencedTableName: 'sectors', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createIndex('kpis', new TableIndex({ columnNames: ['tenant_id'] }));
    await queryRunner.createIndex('kpis', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('kpis', new TableIndex({ columnNames: ['sector_id'] }));
    await queryRunner.createIndex('kpis', new TableIndex({ columnNames: ['type'] }));
    await queryRunner.createIndex('kpis', new TableIndex({ columnNames: ['start_date'] }));
    await queryRunner.createIndex('kpis', new TableIndex({ columnNames: ['end_date'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('kpis', true);
    await queryRunner.dropTable('inventory', true);
    await queryRunner.dropTable('mermas', true);
    await queryRunner.dropTable('sales', true);
    await queryRunner.dropTable('sectors', true);
    await queryRunner.dropTable('sync_queue', true);
    await queryRunner.dropTable('attachments', true);
    await queryRunner.dropTable('tickets', true);
    await queryRunner.dropTable('work_orders', true);
    await queryRunner.dropTable('visits', true);
    await queryRunner.dropTable('nfc_tags', true);
    await queryRunner.dropTable('machines', true);
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('tenants', true);
  }
}
