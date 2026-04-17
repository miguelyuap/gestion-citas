import { TimeSlotStatus } from '@domain/enums/TimeSlotStatus';

/**
 * DTO para crear un nuevo TimeSlot
 */
export class CreateTimeSlotDTO {
  providerId!: string;
  dayOfWeek!: number;
  startTime!: string;
  endTime!: string;
  maxAppointments?: number;
  notes?: string;
  isRecurring?: boolean;
}

/**
 * DTO para actualizar un TimeSlot
 */
export class UpdateTimeSlotDTO {
  startTime?: string;
  endTime?: string;
  maxAppointments?: number;
  status?: TimeSlotStatus;
  notes?: string;
  isRecurring?: boolean;
}

/**
 * DTO para respuesta de TimeSlot
 */
export class TimeSlotResponseDTO {
  id!: string;
  providerId!: string;
  dayOfWeek!: number;
  startTime!: string;
  endTime!: string;
  status!: TimeSlotStatus;
  maxAppointments!: number;
  appointmentsBooked!: number;
  notes!: string | null;
  isRecurring!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * DTO para disponibilidad del proveedor
 */
export class ProviderAvailabilityDTO {
  providerId!: string;
  availableSlots!: TimeSlotResponseDTO[];
  nextAvailableDate?: Date;
}
