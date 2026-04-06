import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'nfcproject_dev',
  password: process.env.DB_PASSWORD || 'nfcproject_pass',
  database: process.env.DB_NAME || 'nfcproject_db',
  entities: [],
  subscribers: [],
  synchronize: false,
  logging: false,
});

async function cleanup() {
  try {
    await dataSource.initialize();
    console.log('📊 Conectado a PostgreSQL');

    const queryRunner = dataSource.createQueryRunner();

    console.log('🧹 Eliminando tablas...');
    await queryRunner.query('DROP TABLE IF EXISTS migrations CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS sync_queue CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS attachments CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS tickets CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS work_orders CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS visits CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS nfc_tags CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS machines CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS users CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS tenants CASCADE');

    console.log('🧹 Eliminando enums...');
    await queryRunner.query('DROP TYPE IF EXISTS users_role_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS machines_status_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS tickets_type_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS tickets_status_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS tickets_priority_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS attachments_type_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS attachments_category_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS visits_status_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS work_orders_type_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS work_orders_status_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS sync_queue_operationtype_enum CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS sync_queue_status_enum CASCADE');

    await queryRunner.release();
    await dataSource.destroy();

    console.log('✅ Limpieza completada exitosamente');
    console.log('Ahora ejecuta: npm run migration:run');
  } catch (error) {
    console.error('❌ Error durante limpieza:', error.message);
    process.exit(1);
  }
}

cleanup();
