import { User } from '@domain/entities/User';
import { UserRole } from '@domain/enums/UserRole';
import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { AppError } from '@shared/utils/AppError';
import { isValidEmail } from '@shared/utils/validators';
import * as bcrypt from 'bcryptjs';

/**
 * UserService
 * Contiene la lógica de negocio relacionada a usuarios
 * - Validaciones de negocio
 * - Hashing de contraseñas
 * - Lógica de cambio de contraseña
 */
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Registrar un nuevo usuario
   */
  async registerUser(
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: UserRole = UserRole.CLIENT
  ): Promise<User> {
    // Validar formato de email
    if (!isValidEmail(email)) {
      throw AppError.badRequest('El email no es válido');
    }

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw AppError.conflict('El email ya está registrado');
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      throw AppError.badRequest(
        'La contraseña debe tener al menos 6 caracteres'
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = User.create(email, hashedPassword, fullName, phone, role);

    // Validar que el usuario sea válido
    if (!user.isValid()) {
      throw AppError.badRequest('Los datos del usuario no son válidos');
    }

    // Guardar en la BD
    const savedUser = await this.userRepository.save(user);

    return savedUser;
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw AppError.notFound('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw AppError.notFound('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Cambiar contraseña de un usuario
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.getUserById(userId);

    // Verificar que la contraseña actual sea correcta
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw AppError.unauthorized('La contraseña actual es incorrecta');
    }

    // Validar que la nueva contraseña sea diferente
    if (currentPassword === newPassword) {
      throw AppError.badRequest(
        'La nueva contraseña debe ser diferente a la actual'
      );
    }

    // Validar que la nueva contraseña tenga mínimo 6 caracteres
    if (newPassword.length < 6) {
      throw AppError.badRequest(
        'La contraseña debe tener al menos 6 caracteres'
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const success = await this.userRepository.updatePassword(
      userId,
      hashedPassword
    );

    if (!success) {
      throw AppError.internalServer(
        'Error al cambiar la contraseña'
      );
    }
  }

  /**
   * Obtener todos los usuarios (con paginación)
   */
  async listUsers(
    limit: number = 10,
    offset: number = 0
  ): Promise<{ users: User[]; total: number }> {
    const users = await this.userRepository.findAll(limit, offset);
    const total = await this.userRepository.count();

    return { users, total };
  }

  /**
   * Obtener proveedores
   */
  async listProviders(
    limit: number = 10,
    offset: number = 0
  ): Promise<{ users: User[]; total: number }> {
    const users = await this.userRepository.findAll(limit, offset);
    const providers = users.filter((user) => user.isProvider());

    return { users: providers, total: providers.length };
  }

  /**
   * Actualizar información del usuario
   */
  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    const user = await this.getUserById(userId);

    const updatedUser = await this.userRepository.update(userId, updates);

    if (!updatedUser) {
      throw AppError.internalServer(
        'Error al actualizar el usuario'
      );
    }

    return updatedUser;
  }

  /**
   * Desactivar usuario
   */
  async deactivateUser(userId: string): Promise<void> {
    await this.getUserById(userId);

    const success = await this.userRepository.deactivate(userId);

    if (!success) {
      throw AppError.internalServer(
        'Error al desactivar el usuario'
      );
    }
  }

  /**
   * Activar usuario
   */
  async activateUser(userId: string): Promise<void> {
    await this.getUserById(userId);

    const success = await this.userRepository.activate(userId);

    if (!success) {
      throw AppError.internalServer(
        'Error al activar el usuario'
      );
    }
  }

  /**
   * Verificar contraseña
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
