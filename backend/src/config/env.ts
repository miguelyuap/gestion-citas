import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración de variables de entorno
 */
export const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appName: process.env.APP_NAME || 'Gestion Citas API',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'citas_db',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d', // Aumentado de 15m a 7d para mantener sesión activa
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@gestion-citas.com',
  },

  // SMS
  sms: {
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  // API Documentation
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
  },

  /**
   * Verifica si estamos en ambiente de desarrollo
   */
  isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  },

  /**
   * Verifica si estamos en ambiente de producción
   */
  isProduction(): boolean {
    return this.nodeEnv === 'production';
  },

  /**
   * Verifica si estamos en ambiente de testing
   */
  isTesting(): boolean {
    return this.nodeEnv === 'test';
  },
};
