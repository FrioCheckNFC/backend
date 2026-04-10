import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const AppDataSource = new DataSource({
  type: 'postgres',
  host:
    process.env.DB_HOST || 'friocheck-db-server.postgres.database.azure.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'friocheck_admin',
  password: process.env.DB_PASSWORD || 'Fr1o-Ch3ck',
  database: process.env.DB_NAME || 'friocheck_db',
  synchronize: false,
  logging: false,
  ssl: { rejectUnauthorized: false },
});

function generateNfcUid(): string {
  return 'NFC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateChecksum(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Conectado a PostgreSQL\n');

    // ========================================
    // 1. CREAR TENANT
    // ========================================
    console.log('1. Creando Tenant...');
    const existingTenant = await AppDataSource.query(
      `SELECT id FROM tenants WHERE slug = 'superfrio'`,
    );

    let tenantId: string;

    if (existingTenant.length === 0) {
      const result = await AppDataSource.query(
        `INSERT INTO tenants (name, slug, description, is_active) 
         VALUES ('SuperFrio Refrigeración', 'superfrio', 'Empresa de refrigeración comercial - Demo', true) 
         RETURNING id`,
      );
      tenantId = result[0].id;
      console.log('   Tenant creado:', tenantId);
    } else {
      tenantId = existingTenant[0].id;
      console.log('   Tenant ya existe:', tenantId);
    }

    // ========================================
    // 2. CREAR USUARIOS
    // ========================================
    console.log('\n2. Creando Usuarios...');

    const users = [
      {
        email: 'admin@friocheck.com',
        password: 'Admin123!',
        firstName: 'Carlos',
        lastName: 'Administrador',
        role: 'ADMIN',
        rut: '12.345.678-9',
      },
      {
        email: 'tecnico@friocheck.com',
        password: 'Tecnico123!',
        firstName: 'Juan',
        lastName: 'Técnico',
        role: 'TECHNICIAN',
        rut: '11.111.111-1',
      },
      {
        email: 'conductor@friocheck.com',
        password: 'Conductor123!',
        firstName: 'Pedro',
        lastName: 'Conductor',
        role: 'DRIVER',
        rut: '22.222.222-2',
      },
      {
        email: 'vendedor@friocheck.com',
        password: 'Vendedor123!',
        firstName: 'María',
        lastName: 'Vendedora',
        role: 'VENDOR',
        rut: '33.333.333-3',
      },
      {
        email: 'soporte@friocheck.com',
        password: 'Soporte123!',
        firstName: 'Ana',
        lastName: 'Soporte',
        role: 'SUPPORT',
        rut: '44.444.444-4',
      },
    ];

    const userIds: Record<string, string> = {};

    for (const u of users) {
      const existing = await AppDataSource.query(
        `SELECT id, role FROM users WHERE email = $1`,
        [u.email],
      );

      const roleArray = '{' + u.role + '}'; // Convertir a formato array PostgreSQL
      const hashedPassword = await bcrypt.hash(u.password, 10);

      if (existing.length === 0) {
        const result = await AppDataSource.query(
          `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, role, active, rut) 
           VALUES ($1, $2, $3, $4, $5, $6, true, $7) 
           RETURNING id`,
          [
            tenantId,
            u.email,
            hashedPassword,
            u.firstName,
            u.lastName,
            roleArray,
            u.rut,
          ],
        );
        userIds[u.role] = result[0].id;
        console.log(`   ${u.role} creado: ${u.email}`);
      } else {
        // Actualizar password, role y rut
        await AppDataSource.query(
          `UPDATE users SET password_hash = $1, role = $2, rut = $3 WHERE email = $4`,
          [hashedPassword, roleArray, u.rut, u.email],
        );
        userIds[u.role] = existing[0].id;
        console.log(`   ${u.role} actualizado: ${u.email}`);
      }
    }

    // ========================================
    // 3. CREAR MÁQUINAS
    // ========================================
    console.log('\n3. Creando Máquinas...');

    const machines = [
      {
        model: 'Refrigerador Samsung RF28',
        brand: 'Samsung',
        serial: 'SN-RF-00001',
        location: 'Almacén Central',
        status: 'ACTIVE',
        userId: userIds['TECHNICIAN'],
      },
      {
        model: 'Congelador LG GC-B247',
        brand: 'LG',
        serial: 'SN-CG-00002',
        location: 'Sucursal Norte',
        status: 'ACTIVE',
        userId: userIds['TECHNICIAN'],
      },
      {
        model: 'Vitrina Refrigerada Whirlpool',
        brand: 'Whirlpool',
        serial: 'SN-VT-00003',
        location: 'Sucursal Sur',
        status: 'ACTIVE',
        userId: null,
      },
      {
        model: 'Cámara Frigorífica Industrial',
        brand: 'Carrier',
        serial: 'SN-CF-00004',
        location: 'Planta Principal',
        status: 'MAINTENANCE',
        userId: userIds['TECHNICIAN'],
      },
      {
        model: 'Refrigerador Mabe RMP420',
        brand: 'Mabe',
        serial: 'SN-RF-00005',
        location: 'Sucursal Centro',
        status: 'ACTIVE',
        userId: null,
      },
    ];

    const machineIds: string[] = [];

    for (const m of machines) {
      const existing = await AppDataSource.query(
        `SELECT id FROM machines WHERE serial_number = $1 AND tenant_id = $2`,
        [m.serial, tenantId],
      );

      if (existing.length === 0) {
        const lat = -34.6037 + (Math.random() - 0.5) * 0.1;
        const lng = -58.3816 + (Math.random() - 0.5) * 0.1;
        const result = await AppDataSource.query(
          `INSERT INTO machines (tenant_id, model, brand, serial_number, location_name, status, assigned_user_id, location_lat, location_lng) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           RETURNING id`,
          [
            tenantId,
            m.model,
            m.brand,
            m.serial,
            m.location,
            m.status,
            m.userId,
            lat,
            lng,
          ],
        );
        machineIds.push(result[0].id);
        console.log(`   Máquina creada: ${m.serial} - ${m.brand}`);
      } else {
        machineIds.push(existing[0].id);
        console.log(`   Máquina ya existe: ${m.serial}`);
      }
    }

    // ========================================
    // 4. CREAR NFC TAGS
    // ========================================
    console.log('\n4. Creando NFC Tags...');

    for (let i = 0; i < machineIds.length; i++) {
      const machineId = machineIds[i];
      const machineSerial = machines[i].serial;

      const existing = await AppDataSource.query(
        `SELECT id FROM nfc_tags WHERE machine_id = $1`,
        [machineId],
      );

      if (existing.length === 0) {
        const uid = generateNfcUid();
        await AppDataSource.query(
          `INSERT INTO nfc_tags (tenant_id, machine_id, uid, tag_model, machine_serial_id, tenant_id_obfuscated, integrity_checksum, is_locked, is_active) 
           VALUES ($1, $2, $3, 'NTAG-215', $4, $5, $6, false, true)`,
          [
            tenantId,
            machineId,
            uid,
            machineSerial,
            tenantId.substring(0, 8),
            generateChecksum(),
          ],
        );
        console.log(`   NFC Tag creado para ${machineSerial}: ${uid}`);
      } else {
        console.log(`   NFC Tag ya existe para ${machineSerial}`);
      }
    }

    // ========================================
    // RESUMEN
    // ========================================
    const jwtSecret =
      process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    const adminUser = await AppDataSource.query(
      `SELECT id, email, role FROM users WHERE email = 'admin@friocheck.com'`,
    );

    const testToken = jwt.sign(
      {
        email: adminUser[0].email,
        sub: adminUser[0].id,
        role: adminUser[0].role,
        tenantId: tenantId,
      },
      jwtSecret,
      { expiresIn: '24h' },
    );

    console.log(
      '\n============================================================',
    );
    console.log('  SEED COMPLETADO EXITOSAMENTE');
    console.log(
      '============================================================\n',
    );

    console.log('TENANT:');
    console.log('  ID:', tenantId);
    console.log('  Nombre: SuperFrio Refrigeración');
    console.log('  Slug: superfrio');

    console.log('\nUSUARIOS CREADOS:');
    console.log(
      '┌─────────────────────────────┬───────────────┬──────────────┐',
    );
    console.log(
      '│ Email                       │ Contraseña    │ Rol          │',
    );
    console.log(
      '├─────────────────────────────┼───────────────┼──────────────┤',
    );
    for (const u of users) {
      console.log(
        `│ ${u.email.padEnd(27)} │ ${u.password.padEnd(13)} │ ${u.role.padEnd(12)} │`,
      );
    }
    console.log(
      '└─────────────────────────────┴───────────────┴──────────────┘',
    );

    console.log('\nMÁQUINAS CREADAS:', machineIds.length);
    console.log('NFC TAGS CREADOS:', machineIds.length);

    console.log(
      '\n============================================================',
    );
    console.log('  CÓMO USAR');
    console.log(
      '============================================================\n',
    );

    console.log('1. LOGIN (obtener token JWT):');
    console.log(`   curl -X POST http://localhost:3001/auth/login \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(
      `     -d '{"email":"${users[0].email}","password":"${users[0].password}"}'`,
    );

    console.log('\n2. USAR TOKEN en requests protegidos:');
    console.log('   curl http://localhost:3001/machines \\');
    console.log('     -H "Authorization: Bearer <TOKEN_AQUI>" \\');
    console.log(`     -H "X-Tenant-Id: ${tenantId}"`);

    console.log('\n3. Token de test (expira en 24h):');
    console.log('   ' + testToken);
    console.log(
      '\n============================================================\n',
    );

    await AppDataSource.destroy();
    console.log('Seeder finalizado\n');
  } catch (error) {
    console.error('Error en seeder:', error);
    process.exit(1);
  }
}

seed();
