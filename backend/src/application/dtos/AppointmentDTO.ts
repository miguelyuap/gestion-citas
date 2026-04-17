import { AppointmentStatus } from '@domain/enums/AppointmentStatus';

/**
 * DTO para crear una nueva cita
 */
export class CreateAppointmentDTO {
  clientId!: string;
  providerId!: string;
  serviceType!: string;
  startTime!: Date;
  endTime!: Date;
  notes?: string;
}

/**
 * DTO para actualizar una cita
 */
export class UpdateAppointmentDTO {
  serviceType?: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  status?: AppointmentStatus;
}

/**
 * DTO para cancelar una cita
 */
export class CancelAppointmentDTO {
  cancellationReason!: string;
}

/**
 * DTO para respuesta de cita
 */
export class AppointmentResponseDTO {
  id!: string;
  clientId!: string;
  providerId!: string;
  serviceType!: string;
  startTime!: Date;
  endTime!: Date;
  status!: AppointmentStatus;
  notes!: string | null;
  cancellationReason!: string | null;
  cancelledBy!: string | null;
  cancelledAt!: Date | null;
  completedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * DTO para listar citas con filtros
 */
export class AppointmentFilterDTO {
  clientId?: string;
  providerId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
