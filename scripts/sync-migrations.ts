import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

/**
 * Script de sincronización de migraciones (RESET & SQUASH)
 * 
 * Este script realiza dos tareas críticas:
 * 1. Limpia la tabla 'migrations' en la base de datos.
 * 2. Inserta el registro de la nueva migración consolidada como 'ya ejecutada'.
 */
async function syncMigrations() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('--- Reseteando Historial de Migraciones ---');
    await dataSource.initialize();
    
    // 1. Borrar tabla de migraciones vieja para empezar de cero
    console.log('Limpiando tabla "migrations"...');
    await dataSource.query('DROP TABLE IF EXISTS "migrations"');
    
    // 2. Dejar que TypeORM cree la tabla de nuevo
    console.log('Creando nueva tabla de metadatos...');
    await dataSource.query(`
      CREATE TABLE "migrations" (
        "id" SERIAL PRIMARY KEY,
        "timestamp" bigint NOT NULL,
        "name" varchar NOT NULL
      )
    `);

    // 3. Insertar la nueva migración squash como ya ejecutada
    // Timestamp: 1785000000000
    // Nombre: InitialSquashedSchema1785000000000
    console.log('Marcando "InitialSquashedSchema1785000000000" como completada...');
    await dataSource.query(
      'INSERT INTO "migrations" (timestamp, name) VALUES ($1, $2)',
      [1785000000000, 'InitialSquashedSchema1785000000000']
    );

    console.log('✅ Sincronización completada con éxito.');
    console.log('Ahora el historial de Azure está alineado con el código limpio.');
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

syncMigrations();
