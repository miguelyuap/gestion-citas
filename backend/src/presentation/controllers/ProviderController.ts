import { Request, Response, NextFunction } from 'express';
import { ProviderService } from '@application/services/ProviderService';
import { CreateProviderDTO, SearchProviderDTO } from '@application/dtos/ProviderDTO';
import { ApiResponse } from '@shared/utils/ApiResponse';
import { AuthRequest } from '../middlewares/authMiddleware';

export class ProviderController {
  constructor(private providerService: ProviderService) { }

  listProviders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: SearchProviderDTO = req.query;
      const providers = await this.providerService.listProviders(filters);
      res.status(200).json(ApiResponse.success('Proveedores listados', providers));
    } catch (error) {
      next(error);
    }
  };

  getProviderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const provider = await this.providerService.getProviderById(id);
      res.status(200).json(ApiResponse.success('Detalle del proveedor', provider));
    } catch (error) {
      next(error);
    }
  };

  createProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user!.id;
      const dto: CreateProviderDTO = req.body;

      // Forzamos el userId del token por seguridad
      dto.userId = userId;

      const provider = await this.providerService.createProvider(dto);
      res.status(201).json(ApiResponse.created('Perfil de proveedor creado', provider));
    } catch (error) {
      next(error);
    }
  };

  getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user!.id;
      const provider = await this.providerService.getProviderByUserId(userId);
      res.status(200).json(ApiResponse.success('Perfil de proveedor obtenido', provider));
    } catch (error) {
      next(error);
    }
  };
}