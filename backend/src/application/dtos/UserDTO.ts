import { IsEmail, IsString, MinLength, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@domain/enums/UserRole';

/**
 * DTO para crear un nuevo usuario
 */
export class CreateUserDTO {
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsString({ message: 'El nombre completo debe ser texto' })
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  fullName!: string;

  @IsString({ message: 'El teléfono debe ser texto' })
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  phone!: string;

  @IsEnum(UserRole, { message: 'El rol no es válido' })
  @IsOptional()
  role?: UserRole;
}

/**
 * DTO para actualizar configuración (Perfil y Preferencias IA)
 */
export class UpdateSettingsDTO {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  triageEnabled?: boolean;

  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

/**
 * DTO para actualizar un usuario
 */
export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

/**
 * DTO para cambiar contraseña
 */
export class ChangePasswordDTO {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}

/**
 * DTO para respuesta de usuario (sin contraseña)
 */
export class UserResponseDTO {
  id!: string;
  email!: string;
  fullName!: string;
  phone!: string;
  role!: UserRole;
  isActive!: boolean;
  emailVerified!: boolean;
  lastLogin!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
  triageEnabled!: boolean;
  specialInstructions?: string;
}
