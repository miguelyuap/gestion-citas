/**
 * DTO para login
 */
export class LoginDTO {
  email!: string;
  password!: string;
}

/**
 * DTO para respuesta de autenticación
 */
export class AuthResponseDTO {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

/**
 * DTO para refresh token
 */
export class RefreshTokenDTO {
  refreshToken!: string;
}

/**
 * DTO para verificar email
 */
export class VerifyEmailDTO {
  email!: string;
  code!: string;
}

/**
 * DTO para recuperación de contraseña
 */
export class ForgotPasswordDTO {
  email!: string;
}

/**
 * DTO para reset de contraseña
 */
export class ResetPasswordDTO {
  token!: string;
  newPassword!: string;
  confirmPassword!: string;
}
