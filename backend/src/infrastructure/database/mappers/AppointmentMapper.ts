import { AppointmentEntity } from '../entities/AppointmentEntity';
import { Appointment } from '@domain/entities/Appointment';
import { AppointmentStatus } from '@domain/enums/AppointmentStatus';

export class AppointmentMapper {
  /**
   * Convierte una entidad de BD a una entidad de dominio
   */
  static toDomain(raw: AppointmentEntity): Appointment {
    const appointment = Appointment.create(
      raw.clientId,
      raw.providerId,
      raw.serviceType || 'General',
      raw.startTime,
      raw.endTime,
      raw.notes || undefined
    );

    appointment.id = raw.id;
    appointment.status = raw.status;
    appointment.cancellationReason = raw.cancellationReason || null;
    appointment.cancelledBy = raw.cancelledBy || null;
    appointment.cancelledAt = raw.cancelledAt || null;
    appointment.completedAt = raw.completedAt || null;
    appointment.createdAt = raw.createdAt;
    appointment.updatedAt = raw.updatedAt;

    return appointment;
  }

  /**
   * Convierte una entidad de dominio a una entidad de BD
   */
  static toPersistence(appointment: Appointment): Partial<AppointmentEntity> {
    return {
      clientId: appointment.clientId,
      providerId: appointment.providerId,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      serviceType: appointment.serviceType,
      notes: appointment.notes || undefined,
      cancellationReason: appointment.cancellationReason || undefined,
      cancelledBy: appointment.cancelledBy || undefined,
      cancelledAt: appointment.cancelledAt || undefined,
      completedAt: appointment.completedAt || undefined,
    };
  }

  /**
   * Convierte una entidad de dominio o BD a DTO para respuesta
   */
  static toDTO(raw: AppointmentEntity | Appointment): any {
    const isEntity = 'provider' in raw;
    const data: any = isEntity ? raw : raw;

    return {
      id: data.id,
      clientId: data.clientId,
      providerId: data.providerId,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      serviceType: isEntity ? (raw as AppointmentEntity).serviceType : (raw as Appointment).serviceType,
      notes: data.notes,
      cancellationReason: data.cancellationReason,
      cancelledAt: data.cancelledAt,
      completedAt: data.completedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      provider: isEntity && (raw as AppointmentEntity).provider ? {
        id: (raw as AppointmentEntity).provider.id,
        businessName: (raw as AppointmentEntity).provider.businessName,
        specialty: (raw as AppointmentEntity).provider.specialty,
        address: (raw as AppointmentEntity).provider.address,
        city: (raw as AppointmentEntity).provider.city
      } : null,
      client: isEntity && (raw as AppointmentEntity).client ? {
        id: (raw as AppointmentEntity).client.id,
        fullName: `${(raw as AppointmentEntity).client.firstName} ${(raw as AppointmentEntity).client.lastName}`,
        email: (raw as AppointmentEntity).client.email,
        phone: (raw as AppointmentEntity).client.phone
      } : null
    };
  }
}
