import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from '@config/env';
import { logger } from '@config/logger';
import { AppError } from '@shared/utils/AppError';
import authRoutes from '@presentation/routes/authRoutes';
import userRoutes from '@presentation/routes/userRoutes';
import providerRoutes from '@presentation/routes/providerRoutes';
import appointmentRoutes from '@presentation/routes/appointmentRoutes';
import timeslotRoutes from '@presentation/routes/timeslotRoutes';

/**
 * Crea y configura la aplicación Express
 */
export function createApp(): Express {
  const app = express();

  // Middlewares globales
  // ==================

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // CORS
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Logging de requests (en desarrollo)
  if (config.isDevelopment()) {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.path}`, { body: req.body });
      next();
    });
  }

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  });

  // API info
  app.get('/api/info', (_req: Request, res: Response) => {
    res.json({
      name: config.appName,
      version: '1.0.0',
      environment: config.nodeEnv,
    });
  });

  // Rutas de API
  // ===================================
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/providers', providerRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/timeslots', timeslotRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Ruta no encontrada',
      statusCode: 404,
    });
  });

  // Error handler global
  app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode,
      });
    }

    // Error no controlado
    res.status(500).json({
      success: false,
      message: config.isDevelopment() ? error.message : 'Error interno del servidor',
      statusCode: 500,
    });
  });

  return app;
}

export default createApp;
