import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@application/services/AuthService';
import { AppError } from '@shared/utils/AppError';
import { UserRole } from '@domain/enums/UserRole';

// Extendemos la interfaz Request para incluir el usuario
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw AppError.unauthorized('No se proporcionó token de autenticación');
    }

    const token = AuthService.extractTokenFromHeader(authHeader);
    
    // Instanciamos AuthService solo para verificar (en un entorno real usaríamos DI)
    // Aquí usamos un método estático o helper si fuera posible, pero verifyAccessToken es de instancia
    // Para simplificar, asumimos que la verificación es stateless en AuthService
    // Nota: En una implementación estricta, AuthService debería ser inyectado o static
    const authService = new AuthService({} as any); // Hack temporal para acceder al método verify
    const payload = authService.verifyAccessToken(token);

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      return next(AppError.forbidden('No tienes permisos para realizar esta acción'));
    }
    next();
  };
};