export const UserRole = {
    CLIENT: 'CLIENT',
    PROVIDER: 'PROVIDER',
    ADMIN: 'ADMIN'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role?: UserRole;
}
