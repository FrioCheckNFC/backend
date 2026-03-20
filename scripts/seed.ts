import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Tenant } from '../src/tenants/entities/tenant.entity';
import { User, UserRole } from '../src/users/entities/user.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'nfcproject_dev',
  password: process.env.DB_PASSWORD || 'nfcproject_pass',
  database: process.env.DB_NAME || 'nfcproject_db',
  entities: [Tenant, User],
  synchronize: false,
  logging: false,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a PostgreSQL\n');

    // Crear tenant
    const tenantRepo = AppDataSource.getRepository(Tenant);
    const userRepo = AppDataSource.getRepository(User);

    let tenant = await tenantRepo.findOne({ where: { slug: 'demo' } });

    if (!tenant) {
      tenant = tenantRepo.create({
        name: 'Demostración Tenant',
        slug: 'demo',
        description: 'Tenant para pruebas de autenticación JWT',
        active: true,
      });
      await tenantRepo.save(tenant);
      console.log('✅ Tenant creado:', tenant.id, '\n');
    } else {
      console.log('⚠️  Tenant ya existe:', tenant.id, '\n');
    }

    // Crear usuario admin
    const adminEmail = 'admin@demo.com';
    const adminPassword = 'Admin123!';

    let adminUser = await userRepo.findOne({ where: { email: adminEmail } });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      adminUser = userRepo.create({
        email: adminEmail,
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'Sistema',
        tenant_id: tenant.id,
        role: UserRole.ADMIN,
        active: true,
      });

      await userRepo.save(adminUser);
      console.log('✅ Usuario Admin creado\n');
    } else {
      console.log('⚠️  Usuario Admin ya existe\n');
    }

    // Generar JWT de prueba
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const testToken = jwt.sign(
      {
        email: adminEmail,
        sub: adminUser.id,
        role: adminUser.role,
        tenantId: tenant.id,
      },
      jwtSecret,
      { expiresIn: '24h' },
    );

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 CREDENCIALES PARA PRUEBAS');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Contraseña:', adminPassword);
    console.log('🔐 Tenant ID:', tenant.id);
    console.log('👤 Usuario ID:', adminUser.id);
    console.log('🎭 Rol:', adminUser.role);
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🚀 CÓMO USAR');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('1️⃣  LOGIN (obtener token JWT):');
    console.log('   curl -X POST http://localhost:3001/auth/login \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log(`     -d '{"email":"${adminEmail}","password":"${adminPassword}"}'`);
    console.log('\n2️⃣  USAR TOKEN en requests protegidos:');
    console.log('   curl http://localhost:3001/tenants \\');
    console.log('     -H "Authorization: Bearer <TOKEN_AQUI>"');
    console.log('\n3️⃣  Token de test (expira en 24h):');
    console.log('   ' + testToken);
    console.log('\n═══════════════════════════════════════════════════════════\n');

    await AppDataSource.destroy();
    console.log('✅ Seeder completado exitosamente\n');
  } catch (error) {
    console.error('❌ Error en seeder:', error);
    process.exit(1);
  }
}

seed();
