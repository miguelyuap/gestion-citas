import api from './api';

export interface CreateAppointmentDTO {
    providerId: string;
    serviceType: string;
    startTime: string; // ISO Date string
    endTime: string;   // ISO Date string
    notes?: string;
}

export interface Appointment {
    id: string;
    providerId: string;
    clientId: string;
    serviceType: string;
    startTime: string;
    endTime: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
    provider?: {
        id: string;
        businessName: string;
        specialty: string;
        address: string;
        city: string;
    } | null;
    client?: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
    } | null;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const appointmentService = {
    async create(data: CreateAppointmentDTO): Promise<Appointment> {
        const response = await api.post<ApiResponse<Appointment>>('/appointments', data);
        return response.data.data;
    },

    async getMyAppointments(): Promise<Appointment[]> {
        const response = await api.get<ApiResponse<{ appointments: Appointment[], total: number } | Appointment[]>>('/appointments/my-appointments');
        const data = response.data.data;
        return Array.isArray(data) ? data : data.appointments;
    },

    async getProviderAppointments(providerId: string): Promise<Appointment[]> {
        const response = await api.get<ApiResponse<{ appointments: Appointment[], total: number }>>(`/appointments/provider/${providerId}`);
        return response.data.data.appointments;
    },

    async confirm(id: string): Promise<Appointment> {
        const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/confirm`);
        return response.data.data;
    },

    async complete(id: string): Promise<Appointment> {
        const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/complete`);
        return response.data.data;
    },

    async analyzeAppointment(message: string, history?: any[]): Promise<{ apto: boolean, message: string, missingRequirements?: string[] }> {
        const response = await api.post<ApiResponse<{ apto: boolean, message: string, missingRequirements?: string[] }>>('/analyze-appointment', { message, history });
        return response.data.data; // Assuming it wraps in data.data
    }
};
