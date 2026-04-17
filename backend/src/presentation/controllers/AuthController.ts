import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@application/services/AuthService';
import { CreateUserDTO } from '@application/dtos/UserDTO';
import { LoginDTO, RefreshTokenDTO } from '@application/dtos/AuthDTO';
import { ApiResponse } from '@shared/utils/ApiResponse';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateUserDTO = req.body;
      const result = await this.authService.register(
        dto.email,
        dto.password,
        dto.fullName,
        dto.phone
      );
      res.status(201).json(ApiResponse.created('Usuario registrado exitosamente', result));
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: LoginDTO = req.body;
      const result = await this.authService.login(dto.email, dto.password);
      res.status(200).json(ApiResponse.success('Login exitoso', result));
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: RefreshTokenDTO = req.body;
      const accessToken = await this.authService.refreshAccessToken(dto.refreshToken);
      res.status(200).json(ApiResponse.success('Token renovado', { accessToken }));
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Asumimos que authMiddleware ya puso el user en req
      const userId = (req as any).user?.id;
      if (userId) {
        await this.authService.logout(userId);
      }
      res.status(200).json(ApiResponse.success('Sesión cerrada'));
    } catch (error) {
      next(error);
    }
  };
}