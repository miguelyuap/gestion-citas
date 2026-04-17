import { Router } from 'express';
import { ProviderController } from '../controllers/ProviderController';
import { ProviderService } from '@application/services/ProviderService';
import { ProviderRepository } from '@infrastructure/database/repositories/ProviderRepository';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/requestValidator';
import { CreateProviderDTO } from '@application/dtos/ProviderDTO';

const router = Router();

// Inyección de dependencias
const providerRepository = new ProviderRepository();
const providerService = new ProviderService(providerRepository);
const providerController = new ProviderController(providerService);

// Rutas públicas
router.get('/', providerController.listProviders);
router.get('/:id', providerController.getProviderById);

// Rutas protegidas
router.post('/',
  authMiddleware,
  validateRequest(CreateProviderDTO),
  providerController.createProvider
);

router.get('/me/profile',
  authMiddleware,
  providerController.getMyProfile
);

export default router;