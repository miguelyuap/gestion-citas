import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '@application/services/AuthService';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { validateRequest } from '../middlewares/requestValidator';
import { CreateUserDTO } from '@application/dtos/UserDTO';
import { LoginDTO, RefreshTokenDTO } from '@application/dtos/AuthDTO';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Inyección de dependencias manual
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Rutas públicas
router.post('/register', validateRequest(CreateUserDTO), authController.register);
router.post('/login', validateRequest(LoginDTO), authController.login);
router.post('/refresh', validateRequest(RefreshTokenDTO), authController.refreshToken);

// Rutas protegidas
router.post('/logout', authMiddleware, authController.logout);

export default router;