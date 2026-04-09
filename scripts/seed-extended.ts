import 'dotenv/config';
import { DataSource } from 'typeorm';

async function seedExtended() {
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
    console.log('Conectado a PostgreSQL para Seed Extendido\n');

    // 1. Obtener recursos básicos
    const tenant = (await AppDataSource.query("SELECT id FROM tenants WHERE slug = 'superfrio' LIMIT 1"))[0];
    const techUser = (await AppDataSource.query("SELECT id FROM users WHERE email = 'tecnico@friocheck.com' LIMIT 1"))[0];
    const vendorUser = (await AppDataSource.query("SELECT id FROM users WHERE email = 'vendedor@friocheck.com' LIMIT 1"))[0];
    const adminUser = (await AppDataSource.query("SELECT id FROM users WHERE email = 'admin@friocheck.com' LIMIT 1"))[0];
    const machines = await AppDataSource.query("SELECT id, serial_number FROM machines WHERE tenant_id = $1", [tenant.id]);

    if (!tenant || !techUser || !machines.length) {
      console.error('Faltan datos base (Tenant, Usuarios o Máquinas). Ejecuta el seed básico primero.');
      return;
    }

    // 2. SECTORES
    console.log('1. Poblando Sectores...');
    const sectors = [
      { name: 'Sector Norte', description: 'Zona Industrial Quilicura', address: 'Av. Américo Vespucio 1234' },
      { name: 'Sector Centro', description: 'Casco Histórico Santiago', address: 'Alameda 456' },
      { name: 'Sector Sur', description: 'Centro Logístico San Bernardo', address: 'Ruta 5 Sur km 20' }
    ];
    const sectorIds: string[] = [];
    for (const s of sectors) {
      const exists = await AppDataSource.query("SELECT id FROM sectors WHERE name = $1 AND tenant_id = $2", [s.name, tenant.id]);
      if (exists.length === 0) {
        const res = await AppDataSource.query(
          "INSERT INTO sectors (tenant_id, name, description, address, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id",
          [tenant.id, s.name, s.description, s.address]
        );
        sectorIds.push(res[0].id);
        console.log(`   Sector creado: ${s.name}`);
      } else {
        sectorIds.push(exists[0].id);
      }
    }

    // 3. INVENTARIO
    console.log('\n2. Poblando Inventario...');
    const inventoryItems = [
      { name: 'Filtro de Aire Industrial', sku: 'FLT-001', qty: 50, min: 10, cost: 15000 },
      { name: 'Sensor de Temperatura K', sku: 'SNS-002', qty: 5, min: 15, cost: 8500 }, // Stock bajo
      { name: 'Compresor 2HP Whirlpool', sku: 'CMP-003', qty: 8, min: 2, cost: 125000 },
      { name: 'Gas Refrigerante R410a', sku: 'GAS-004', qty: 20, min: 5, cost: 45000 },
      { name: 'Válvula de Expansión', sku: 'VLV-005', qty: 0, min: 5, cost: 12000 } // Agotado
    ];
    for (const item of inventoryItems) {
      const exists = await AppDataSource.query("SELECT id FROM inventory WHERE part_name = $1 AND tenant_id = $2", [item.name, tenant.id]);
      if (exists.length === 0) {
        await AppDataSource.query(
          "INSERT INTO inventory (tenant_id, part_name, part_number, quantity, min_quantity, unit_cost, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [tenant.id, item.name, item.sku, item.qty, item.min, item.cost, item.qty > item.min ? 'disponible' : (item.qty === 0 ? 'agotado' : 'en_pedido')]
        );
        console.log(`   Item de inventario: ${item.name}`);
      }
    }

    // 4. TICKETS Y ÓRDENES DE TRABAJO
    console.log('\n3. Poblando Tickets y Work Orders...');
    for (let i = 0; i < 3; i++) {
        const m = machines[i % machines.length];
        const ticketRes = await AppDataSource.query(
            "INSERT INTO tickets (tenant_id, machine_id, created_by_id, title, description, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [tenant.id, m.id, adminUser?.id || techUser.id, `Falla en ${m.serial_number}`, 'La máquina no enfría correctamente.', 'high', 'open']
        );
        const ticketId = ticketRes[0].id;
        
        await AppDataSource.query(
            "INSERT INTO work_orders (tenant_id, machine_id, created_by_id, assigned_to_id, title, description, status, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [tenant.id, m.id, adminUser?.id || techUser.id, techUser.id, `Revisión Técnica: ${m.serial_number}`, 'Verificar niveles de gas y limpieza de filtros.', 'in-progress', 'high']
        );
        console.log(`   Ticket y WO creados para ${m.serial_number}`);
    }

    // 5. VENTAS (Últimos 30 días)
    console.log('\n4. Poblando Ventas (Simulando 30 días)...');
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const sectorId = sectorIds[i % sectorIds.length];
        const amount = Math.floor(Math.random() * 50000) + 10000;
        
        await AppDataSource.query(
            "INSERT INTO sales (tenant_id, vendor_id, sector_id, machine_id, amount, description, sale_date) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [tenant.id, vendorUser?.id || techUser.id, sectorId, machines[0].id, amount, `Venta diaria sector ${i}`, date]
        );
    }
    console.log('   30 registros de ventas insertados.');

    // 6. KPIs
    console.log('\n5. Poblando KPIs...');
    const kpiData = [
      { name: 'Meta Visitas Mensuales', type: 'visitas', target: 100, current: 45 },
      { name: 'Meta Ventas Zona Norte', type: 'ventas', target: 500000, current: 125000 },
      { name: 'Resolución de Tickets', type: 'tickets', target: 20, current: 8 }
    ];
    for (const k of kpiData) {
        await AppDataSource.query(
            "INSERT INTO kpis (tenant_id, user_id, type, name, target_value, current_value) VALUES ($1, $2, $3, $4, $5, $6)",
            [tenant.id, techUser.id, k.type, k.name, k.target, k.current]
        );
        console.log(`   KPI creado: ${k.name}`);
    }

    console.log('\n============================================================');
    console.log('  SEED EXTENDIDO COMPLETADO EXITOSAMENTE');
    console.log('============================================================\n');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error en seed extendido:', error);
    process.exit(1);
  }
}

seedExtended();
