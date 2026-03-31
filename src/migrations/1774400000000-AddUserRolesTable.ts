import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddUserRolesTable1774400000000 implements MigrationInterface {
  name = 'AddUserRolesTable1774400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla user_roles para sistema multi-rol
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 2. Crear foreign key con cascade delete
    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 3. Crear índice único para evitar roles duplicados por usuario
    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'IDX_USER_ROLES_UNIQUE',
        columnNames: ['user_id', 'role'],
        isUnique: true,
      }),
    );

    // 4. Crear índice para búsquedas rápidas por usuario
    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'IDX_USER_ROLES_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    // 5. Crear índice para búsquedas por rol
    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'IDX_USER_ROLES_ROLE',
        columnNames: ['role'],
      }),
    );

    // 6. Migrar datos existentes: copiar el rol actual de cada usuario a user_roles
    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role)
      SELECT id, role::text FROM users 
      WHERE role IS NOT NULL
      ON CONFLICT DO NOTHING
    `);

    // 7. Hacer la columna role nullable en users (mantiene compatibilidad hacia atrás)
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Restaurar NOT NULL en columna role de users
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role SET NOT NULL
    `);

    // 2. Eliminar tabla user_roles (los índices y FK se eliminan automáticamente)
    await queryRunner.dropTable('user_roles');
  }
}
