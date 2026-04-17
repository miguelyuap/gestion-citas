import { DataSource } from 'typeorm';
import { config } from './env';
import path from 'path';

/**
 * Configuración de la base de datos
 */
export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, '../../data/citas.db'),
  synchronize: config.isDevelopment(),
  logging: config.isDevelopment(),
  entities: [path.join(__dirname, '../infrastructure/database/entities/*{.ts,.js}')],
  migrations: [path.join(__dirname, '../infrastructure/database/migrations/*{.ts,.js}')],
  subscribers: [path.join(__dirname, '../infrastructure/database/subscribers/*{.ts,.js}')],
});

/**
 * Inicializa la conexión a la base de datos
 */
export async function initializeDatabase(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');

      // Ejecutar migraciones
      if (config.isDevelopment()) {
        await AppDataSource.runMigrations();
      }
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Cierra la conexión a la base de datos
 */
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
}
