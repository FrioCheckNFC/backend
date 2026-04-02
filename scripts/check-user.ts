import 'dotenv/config';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'nfcproject_dev',
  password: process.env.DB_PASSWORD || 'nfcproject_pass',
  database: process.env.DB_NAME || 'nfcproject_db',
  synchronize: false,
  logging: false,
  ssl: { rejectUnauthorized: false },
});

async function checkUser() {
  try {
    await AppDataSource.initialize();
    console.log('Conectado a PostgreSQL\n');

    // Verificar usuario
    const user = await AppDataSource.query(
      `SELECT id, rut, email, role FROM users WHERE rut = '1-K'`
    );
    console.log('Usuario:', JSON.stringify(user, null, 2));

    // Verificar roles en user_roles
    const roles = await AppDataSource.query(
      `SELECT * FROM user_roles WHERE user_id = $1`, [user[0].id]
    );
    console.log('\nRoles en user_roles:', JSON.stringify(roles, null, 2));

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
