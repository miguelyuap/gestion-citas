import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
        return response.data.data;
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
        return response.data.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    async refreshToken(token: string): Promise<{ accessToken: string }> {
        const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { token });
        return response.data.data;
    }
};
