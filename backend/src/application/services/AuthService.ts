import * as jwt from 'jsonwebtoken';
import { UserService } from './UserService';
import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { User } from '@domain/entities/User';
import { AppError } from '@shared/utils/AppError';
import { config } from '@config/env';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * AuthService
 * Maneja la autenticación y gestión de tokens JWT
 */
export class AuthService {
  private userService: UserService;

  constructor(private userRepository: IUserRepository) {
    this.userService = new UserService(userRepository);
  }

  /**
   * Registrar un nuevo usuario
   */
  async register(
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await this.userService.registerUser(
      email,
      password,
      fullName,
      phone
    );

    const tokens = this.generateTokens(user);

    // Guardar refresh token en la BD
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    await this.userRepository.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      expiresAt
    );

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Login: verificar email y contraseña
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await this.userService.getUserByEmail(email);

    // Verificar contraseña
    const isPasswordValid = await this.userService.verifyPassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw AppError.unauthorized('Email o contraseña incorrectos');
    }

    // Verificar que el usuario esté activo
    if (!user.isActive || !user.emailVerified) {
      throw AppError.forbidden(
        'El usuario debe verificar su email para acceder'
      );
    }

    // Actualizar último login
    await this.userRepository.updateLastLogin(user.id);

    // Generar tokens
    const tokens = this.generateTokens(user);

    // Guardar refresh token en BD
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    await this.userRepository.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      expiresAt
    );

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Renovar el access token usando el refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as TokenPayload;

      // Verificar que el token existe en la BD
      const user = await this.userRepository.findByRefreshToken(refreshToken);

      if (!user) {
        throw AppError.unauthorized('Refresh token inválido o expirado');
      }

      // Generar nuevo access token
      return this.generateAccessToken(user);
    } catch (error) {
      throw AppError.unauthorized('Refresh token inválido');
    }
  }

  /**
   * Logout: limpiar refresh token
   */
  async logout(userId: string): Promise<void> {
    await this.userRepository.clearRefreshToken(userId);
  }

  /**
   * Generar access token
   */
  private generateAccessToken(user: User): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sign = jwt.sign as (payload: object, secret: string, options: Record<string, unknown>) => string;
    
    return sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      } as TokenPayload,
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );
  }

  /**
   * Generar refresh token
   */
  private generateRefreshToken(user: User): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sign = jwt.sign as (payload: object, secret: string, options: Record<string, unknown>) => string;
    
    return sign(
      {
        id: user.id,
        email: user.email,
      } as TokenPayload,
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpire }
    );
  }

  /**
   * Generar ambos tokens
   */
  private generateTokens(
    user: User
  ): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  /**
   * Verificar y decodificar un access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      throw AppError.unauthorized('Token inválido o expirado');
    }
  }

  /**
   * Extraer token del header Authorization
   */
  static extractTokenFromHeader(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Token no proporcionado');
    }

    return authHeader.substring(7); // Remover "Bearer "
  }
}
