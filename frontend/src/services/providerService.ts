import api from './api';

export interface Provider {
    id: string;
    userId: string;
    businessName: string;
    specialty: string;
    address: string;
    city: string;
    rating: number;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const providerService = {
    async getAll(): Promise<Provider[]> {
        const response = await api.get<ApiResponse<Provider[]>>('/providers');
        return response.data.data;
    },

    async getById(id: string): Promise<Provider> {
        const response = await api.get<ApiResponse<Provider>>(`/providers/${id}`);
        return response.data.data;
    },

    async getMyProfile(): Promise<Provider> {
        const response = await api.get<ApiResponse<Provider>>('/providers/me/profile');
        return response.data.data;
    }
};
