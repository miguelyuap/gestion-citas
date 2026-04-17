import { User } from '../entities/User';

/**
 * Interfaz para el repositorio de Usuarios
 * Define el contrato que todo repositorio de Usuario debe cumplir
 */
export interface IUserRepository {
  /**
   * Encontrar usuario por ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Encontrar usuario por email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Obtener todos los usuarios
   */
  findAll(limit?: number, offset?: number): Promise<User[]>;

  /**
   * Guardar un nuevo usuario
   */
  save(user: User): Promise<User>;

  /**
   * Actualizar un usuario existente
   */
  update(id: string, user: Partial<User>): Promise<User | null>;

  /**
   * Eliminar un usuario
   */
  delete(id: string): Promise<boolean>;

  /**
   * Contar total de usuarios
   */
  count(): Promise<number>;

  /**
   * Verificar si un email ya existe
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Actualizar contraseña de un usuario
   */
  updatePassword(id: string, hashedPassword: string): Promise<boolean>;

  /**
   * Desactivar un usuario
   */
  deactivate(id: string): Promise<boolean>;

  /**
   * Activar un usuario
   */
  activate(id: string): Promise<boolean>;

  /**
   * Actualizar último login
   */
  updateLastLogin(id: string): Promise<boolean>;

  /**
   * Actualizar refresh token
   */
  updateRefreshToken(
    id: string,
    token: string,
    expiresAt: Date
  ): Promise<boolean>;

  /**
   * Limpiar refresh token
   */
  clearRefreshToken(id: string): Promise<boolean>;

  /**
   * Encontrar usuario por refresh token
   */
  findByRefreshToken(token: string): Promise<User | null>;
}
