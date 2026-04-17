import { UserRole } from '../enums/UserRole';

/**
 * Entidad de Dominio: Usuario
 * Representa un usuario del sistema (Cliente, Proveedor o Administrador)
 */
export class User {
  public id!: string;
  public email!: string;
  public password!: string;
  public fullName!: string;
  public phone!: string;
  public role!: UserRole;
  public isActive!: boolean;
  public emailVerified!: boolean;
  public lastLogin!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;
  
  // AI Settings
  public triageEnabled!: boolean;
  public specialInstructions?: string;

  /**
   * Constructor privado para forzar uso de método factory
   */
  private constructor() {}

  /**
   * Método factory para crear una nueva instancia de Usuario
   */
  public static create(
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: UserRole = UserRole.CLIENT
  ): User {
    const user = new User();
    user.email = email;
    user.password = password;
    user.fullName = fullName;
    user.phone = phone;
    user.role = role;
    user.isActive = true;
    user.emailVerified = false;
    user.lastLogin = null;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.triageEnabled = true;
    return user;
  }

  /**
   * Valida que el usuario tenga todos los campos requeridos
   */
  public isValid(): boolean {
    return (
      this.email.length > 0 &&
      this.password.length > 0 &&
      this.fullName.length > 0 &&
      this.phone.length > 0 &&
      this.role in UserRole
    );
  }

  /**
   * Verifica si el usuario es activo
   */
  public isUserActive(): boolean {
    return this.isActive && this.emailVerified;
  }

  /**
   * Actualiza el último login
   */
  public updateLastLogin(): void {
    this.lastLogin = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Verifica si el usuario es proveedor
   */
  public isProvider(): boolean {
    return this.role === UserRole.PROVIDER;
  }

  /**
   * Verifica si el usuario es cliente
   */
  public isClient(): boolean {
    return this.role === UserRole.CLIENT;
  }

  /**
   * Verifica si el usuario es administrador
   */
  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
