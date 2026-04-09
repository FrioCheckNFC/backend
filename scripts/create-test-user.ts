import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function createTestUser() {
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

    // 1. Obtener el tenant
    const tenantRes = await AppDataSource.query("SELECT id FROM tenants WHERE slug = 'superfrio' LIMIT 1;");
    if (tenantRes.length === 0) {
      console.error('No se encontró el tenant superfrio.');
      return;
    }
    const tenantId = tenantRes[0].id;

    // 2. Preparar datos
    const email = 'mobile-test@friocheck.com';
    const rut = '1-k';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);
    const roles = ['TECHNICIAN', 'DRIVER', 'VENDOR'];
    const rolesValue = '{' + roles.join(',') + '}';

    // 3. Insertar usuario
    const existing = await AppDataSource.query("SELECT id FROM users WHERE email = $1 OR rut = $2", [email, rut]);
    
    if (existing.length > 0) {
      console.log('Actualizando usuario existente...');
      await AppDataSource.query(
        "UPDATE users SET password_hash = $1, role = $2, first_name = $3, last_name = $4 WHERE id = $5",
        [hashedPassword, rolesValue, 'Test', 'Mobile', existing[0].id]
      );
      console.log('Usuario actualizado:', email);
    } else {
      console.log('Creando nuevo usuario...');
      await AppDataSource.query(
        "INSERT INTO users (tenant_id, email, rut, password_hash, first_name, last_name, role, active) VALUES ($1, $2, $3, $4, $5, $6, $7, true)",
        [tenantId, email, rut, hashedPassword, 'Test', 'Mobile', rolesValue]
      );
      console.log('Usuario creado exitosamente:', email);
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error creando usuario:', error);
  }
}

createTestUser();
