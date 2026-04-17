import 'reflect-metadata';
import { config } from '@config/env';
import { logger } from '@config/logger';
import { initializeDatabase } from '@config/database';
import { createApp } from './app';

/**
 * Punto de entrada de la aplicación
 */
async function main(): Promise<void> {
  try {
    // Inicializar base de datos
    logger.info('🔄 Inicializando base de datos...');
    await initializeDatabase();

    // Crear aplicación Express
    const app = createApp();

    // Iniciar servidor
    app.listen(config.port, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${config.port}`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`📚 API Docs: http://localhost:${config.port}/api-docs`);
      logger.info(`💓 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (reason: Error) => {
  logger.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error: Error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('📛 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Iniciar aplicación
main();
