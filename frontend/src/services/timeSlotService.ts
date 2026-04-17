import api from './api';

export interface TimeSlot {
    id: string;
    providerId: string;
    dayOfWeek: number;
    startTime: string; // HH:mm
    endTime: string;
    isAvailable: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const timeSlotService = {
    async getAvailable(providerId: string): Promise<TimeSlot[]> {
        const response = await api.get<ApiResponse<TimeSlot[]>>(`/timeslots/provider/${providerId}/available`);
        return response.data.data;
    },

    async getByProvider(providerId: string): Promise<TimeSlot[]> {
        const response = await api.get<ApiResponse<TimeSlot[]>>(`/timeslots/provider/${providerId}`);
        return response.data.data;
    }
};
