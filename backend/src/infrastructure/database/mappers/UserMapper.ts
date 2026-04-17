import { UserEntity } from '../entities/UserEntity';
import { User } from '@domain/entities/User';
import { UserRole } from '@domain/enums/UserRole';

export class UserMapper {
  /**
   * Convierte una entidad de BD a una entidad de dominio
   */
  static toDomain(raw: UserEntity): User {
    const user = User.create(
      raw.email,
      raw.password,
      `${raw.firstName} ${raw.lastName}`,
      raw.phone,
      raw.role
    );

    user.id = raw.id;
    user.emailVerified = raw.emailVerified;
    user.isActive = raw.active;
    user.lastLogin = raw.lastLoginAt || null;
    user.createdAt = raw.createdAt;
    user.updatedAt = raw.updatedAt;
    user.triageEnabled = raw.triageEnabled ?? true;
    user.specialInstructions = raw.specialInstructions;

    return user;
  }

  /**
   * Convierte una entidad de dominio a una entidad de BD
   */
  static toPersistence(user: User): Partial<UserEntity> {
    const [firstName, ...lastNameParts] = user.fullName.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    return {
      firstName,
      lastName,
      email: user.email.toLowerCase(),
      phone: user.phone,
      password: user.password,
      role: user.role,
      emailVerified: user.emailVerified,
      active: user.isActive,
      lastLoginAt: user.lastLogin || undefined,
      triageEnabled: user.triageEnabled,
      specialInstructions: user.specialInstructions,
    };
  }

  /**
   * Convierte una entidad de BD a DTO para respuesta
   */
  static toDTO(raw: UserEntity): {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    emailVerified: boolean;
    active: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    triageEnabled: boolean;
    specialInstructions?: string;
  } {
    return {
      id: raw.id,
      fullName: `${raw.firstName} ${raw.lastName}`,
      email: raw.email,
      phone: raw.phone,
      role: raw.role,
      emailVerified: raw.emailVerified,
      active: raw.active,
      lastLoginAt: raw.lastLoginAt || null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      triageEnabled: raw.triageEnabled ?? true,
      specialInstructions: raw.specialInstructions,
    };
  }
}
