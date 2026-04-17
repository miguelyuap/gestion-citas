import { TimeSlotEntity } from '../entities/TimeSlotEntity';
import { TimeSlot } from '@domain/entities/TimeSlot';
import { TimeSlotStatus } from '@domain/enums/TimeSlotStatus';

export class TimeSlotMapper {
  /**
   * Convierte una entidad de BD a una entidad de dominio
   */
  static toDomain(raw: TimeSlotEntity): TimeSlot {
    const timeSlot = TimeSlot.create(
      raw.providerId,
      raw.dayOfWeek,
      raw.startTime,
      raw.endTime,
      raw.maxAppointments || 1
    );

    timeSlot.id = raw.id;
    timeSlot.status = raw.status;
    timeSlot.appointmentsBooked = raw.appointmentsBooked || 0;
    timeSlot.notes = raw.notes || null;
    timeSlot.createdAt = raw.createdAt;
    timeSlot.updatedAt = raw.updatedAt;

    return timeSlot;
  }

  /**
   * Convierte una entidad de dominio a una entidad de BD
   */
  static toPersistence(timeSlot: TimeSlot): Partial<TimeSlotEntity> {
    return {
      id: timeSlot.id,
      providerId: timeSlot.providerId,
      dayOfWeek: timeSlot.dayOfWeek,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      status: timeSlot.status,
      maxAppointments: timeSlot.maxAppointments,
      appointmentsBooked: timeSlot.appointmentsBooked || 0,
      notes: timeSlot.notes || null,
      isRecurring: true,
    };
  }

  /**
   * Convierte una entidad de BD a DTO para respuesta
   */
  static toDTO(raw: TimeSlotEntity | TimeSlot): {
    id: string;
    providerId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    status: TimeSlotStatus;
    maxAppointments?: number;
    appointmentsBooked?: number;
    isRecurring?: boolean;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    // Si es TimeSlotEntity
    if ('providerId' in raw && (raw as any).createdAt instanceof Date) {
      const entity = raw as TimeSlotEntity;
      return {
        id: entity.id,
        providerId: entity.providerId,
        dayOfWeek: entity.dayOfWeek,
        startTime: entity.startTime,
        endTime: entity.endTime,
        status: entity.status,
        maxAppointments: entity.maxAppointments,
        appointmentsBooked: entity.appointmentsBooked,
        isRecurring: entity.isRecurring,
        notes: entity.notes,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      };
    }

    // Si es TimeSlot (domain entity)
    const timeSlot = raw as TimeSlot;
    return {
      id: timeSlot.id,
      providerId: timeSlot.providerId,
      dayOfWeek: timeSlot.dayOfWeek,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      status: timeSlot.status,
      maxAppointments: timeSlot.maxAppointments,
      appointmentsBooked: timeSlot.appointmentsBooked,
      notes: timeSlot.notes,
      createdAt: timeSlot.createdAt,
      updatedAt: timeSlot.updatedAt,
    };
  }
}
