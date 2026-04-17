import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.login(credentials);
                    set({
                        user: response.user,
                        token: response.accessToken,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    localStorage.setItem('token', response.accessToken);
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Error al iniciar sesión',
                        isLoading: false,
                        isAuthenticated: false
                    });
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.register(data);
                    set({
                        user: response.user,
                        token: response.accessToken,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    localStorage.setItem('token', response.accessToken);
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Error al registrarse',
                        isLoading: false,
                        isAuthenticated: false
                    });
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('token');
                authService.logout().catch(console.error);
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
