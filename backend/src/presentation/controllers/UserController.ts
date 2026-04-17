import { Request, Response, NextFunction } from 'express';
import { UserService } from '@application/services/UserService';
import { UpdateUserDTO, ChangePasswordDTO, UpdateSettingsDTO } from '@application/dtos/UserDTO';
import { ApiResponse } from '@shared/utils/ApiResponse';
import { AuthRequest } from '../middlewares/authMiddleware';

export class UserController {
  constructor(private userService: UserService) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user!.id;
      const user = await this.userService.getUserById(userId);
      // Importante: No devolver password. Usar Mapper o DTO de respuesta en producción.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;
      res.status(200).json(ApiResponse.success('Perfil obtenido', userWithoutPassword));
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user!.id;
      const dto: UpdateUserDTO = req.body;
      const user = await this.userService.updateUser(userId, dto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;
      res.status(200).json(ApiResponse.success('Perfil actualizado', userWithoutPassword));
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user!.id;
      const dto: UpdateSettingsDTO = req.body;
      const user = await this.userService.updateUser(userId, dto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;
      res.status(200).json(ApiResponse.success('Configuración actualizada exitosamente', userWithoutPassword));
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user!.id;
      const dto: ChangePasswordDTO = req.body;
      await this.userService.changePassword(
        userId,
        dto.currentPassword,
        dto.newPassword
      );
      res.status(200).json(ApiResponse.success('Contraseña actualizada correctamente'));
    } catch (error) {
      next(error);
    }
  };
}