import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function updateTestUser() {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'friocheckdb',
    ssl: { rejectUnauthorized: false },
  });

  try {
    await AppDataSource.initialize();
    console.log('Conectado a la base de datos.');

    const email = 'mobile-test@friocheck.com';
    const roles = ['TECHNICIAN', 'DRIVER', 'VENDOR', 'RETAILER']; // Agregado RETAILER
    const rolesValue = '{' + roles.join(',') + '}';

    console.log('Actualizando roles para el usuario:', email);
    await AppDataSource.query(
      "UPDATE users SET role = $1 WHERE email = $2",
      [rolesValue, email]
    );
    console.log('Roles actualizados exitosamente:', roles.join(', '));

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error actualizando usuario:', error);
  }
}

updateTestUser();
