import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppError } from '@shared/utils/AppError';

/**
 * Middleware para validar el cuerpo de la solicitud contra un DTO
 */
export function validateRequest(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObj = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoObj);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        return Object.values(error.constraints || {}).join(', ');
      }).join('; ');
      
      return next(AppError.badRequest(`Error de validación: ${errorMessages}`));
    }

    // Reemplazamos el body con el objeto tipado y limpio
    req.body = dtoObj;
    next();
  };
}