import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Este script sincroniza la tabla de migraciones para marcar como ejecutadas
 * todas las migraciones anteriores a CreateCleanSchema1774300000000.
 * 
 * Esto es necesario porque el esquema fue creado con esa migración única,
 * pero las migraciones anteriores nunca se registraron en la tabla migrations.
 */

const migrations = [
  { timestamp: 1678879200000, name: 'CreateInitialSchema1678879200000' },
  { timestamp: 1678879300000, name: 'UpdateUserRolesEnum1678879300000' },
  { timestamp: 1678879400000, name: 'AddBrandToMachines1678879400000' },
  { timestamp: 1678879500000, name: 'AddMissingColumnsToMachines1678879500000' },
  { timestamp: 1710945000000, name: 'MakeAssignedUserIdNullable1710945000000' },
  { timestamp: 1710950000000, name: 'UpdateMachineStatusEnum1710950000000' },
  { timestamp: 1710955000000, name: 'AddFkColumnsSyncQueue1710955000000' },
  { timestamp: 1710955001000, name: 'AddFkColumnsAttachments1710955001000' },
  { timestamp: 1710955002000, name: 'AddFkColumnsTickets1710955002000' },
  { timestamp: 1710955003000, name: 'AddFkColumnsWorkOrders1710955003000' },
  { timestamp: 1710955004000, name: 'AddFkColumnsMachines1710955004000' },
  { timestamp: 1710955005000, name: 'AddTagModelToNfcTags1710955005000' },
  { timestamp: 1710955007000, name: 'UpdateSchemaConsistency1710955007000' },
  { timestamp: 1710955010000, name: 'FixAttachmentsTableSchema1710955010000' },
  { timestamp: 1710955011000, name: 'AddMissingColumnsToTickets1710955011000' },
  { timestamp: 1710955012000, name: 'AddAllMissingColumnsToTickets1710955012000' },
  { timestamp: 1710955013000, name: 'UpdateTicketsTypeEnum1710955013000' },
  { timestamp: 1710955014000, name: 'RecreateTicketsEnumsLowercase1710955014000' },
  { timestamp: 1710955015000, name: 'FixTicketsTableCompletely1710955015000' },
  { timestamp: 1710955016000, name: 'AddEstimatedDeliveryDateToWorkorders1710955016000' },
  { timestamp: 1710955017000, name: 'RecreateWorkOrdersTableCompletely1710955017000' },
  { timestamp: 1710955018000, name: 'RecreateAttachmentsEnumsLowercase1710955018000' },
  { timestamp: 1710955019000, name: 'RecreateAttachmentsTableCompletely1710955019000' },
  { timestamp: 1774297640209, name: 'AddTimestampsAndSoftDelete1774297640209' },
  { timestamp: 1774298000000, name: 'FixSyncQueueSchema1774298000000' },
  { timestamp: 1774298000001, name: 'RestoreNfcTagHardwareModel1774298000001' },
  { timestamp: 1774298000002, name: 'ImproveGpsPrecision1774298000002' },
  { timestamp: 1774298000003, name: 'FixTicketStatusEnum1774298000003' },
  // CreateCleanSchema1774300000000 ya está registrada
];

async function syncMigrations() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // Verificar que la tabla migrations existe
    const tableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'migrations'
      )
    `);

    if (!tableExists[0].exists) {
      console.log('Migrations table does not exist, skipping sync');
      return;
    }

    // Obtener migraciones ya registradas
    const existingMigrations = await dataSource.query('SELECT name FROM migrations');
    const existingNames = new Set(existingMigrations.map((m: any) => m.name));

    console.log(`Found ${existingNames.size} existing migrations in database`);

    // Insertar las migraciones faltantes
    let inserted = 0;
    for (const migration of migrations) {
      if (!existingNames.has(migration.name)) {
        await dataSource.query(
          'INSERT INTO migrations (timestamp, name) VALUES ($1, $2)',
          [migration.timestamp, migration.name]
        );
        console.log(`Marked as executed: ${migration.name}`);
        inserted++;
      }
    }

    console.log(`Sync complete. Inserted ${inserted} migration records.`);
  } catch (error) {
    console.error('Error syncing migrations:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

syncMigrations();
