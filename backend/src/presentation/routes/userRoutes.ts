import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '@application/services/UserService';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/requestValidator';
import { UpdateUserDTO, ChangePasswordDTO, UpdateSettingsDTO } from '@application/dtos/UserDTO';

const router = Router();

// Inyección de dependencias
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Todas las rutas de usuario requieren autenticación
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.patch('/profile', validateRequest(UpdateUserDTO), userController.updateProfile);
router.patch('/settings', validateRequest(UpdateSettingsDTO), userController.updateSettings);
router.post('/change-password', validateRequest(ChangePasswordDTO), userController.changePassword);

export default router;