import { Appointment } from '@domain/entities/Appointment';
import { AppointmentStatus } from '@domain/enums/AppointmentStatus';
import { IAppointmentRepository } from '@domain/interfaces/IAppointmentRepository';
import { ITimeSlotRepository } from '@domain/interfaces/ITimeSlotRepository';
import { AppError } from '@shared/utils/AppError';
import { AppointmentRepository } from '@infrastructure/database/repositories/AppointmentRepository';
import { TimeSlotRepository } from '@infrastructure/database/repositories/TimeSlotRepository';

/**
 * AppointmentService
 * Maneja toda la lógica de negocio relacionada con citas
 */
export class AppointmentService {
  private appointmentRepository: IAppointmentRepository;
  private timeSlotRepository: ITimeSlotRepository;

  constructor(
    appointmentRepository?: IAppointmentRepository,
    timeSlotRepository?: ITimeSlotRepository
  ) {
    this.appointmentRepository = appointmentRepository || new AppointmentRepository();
    this.timeSlotRepository = timeSlotRepository || new TimeSlotRepository();
  }

  /**
   * Crear una nueva cita
   */
  async createAppointment(
    clientId: string,
    providerId: string,
    reason: string,
    startTime: Date,
    endTime: Date,
    notes?: string
  ): Promise<Appointment> {
    // Validaciones
    if (!clientId || !providerId || !reason) {
      throw AppError.badRequest('clientId, providerId y reason son requeridos');
    }

    if (startTime >= endTime) {
      throw AppError.badRequest('La hora de inicio debe ser anterior a la hora de fin');
    }

    if (startTime < new Date()) {
      throw AppError.badRequest('No se pueden crear citas en el pasado');
    }

    // Verificar conflictos de horario
    const hasConflict = await this.appointmentRepository.hasConflict(
      providerId,
      startTime,
      endTime
    );

    if (hasConflict) {
      throw AppError.conflict('El proveedor tiene una cita en ese horario');
    }

    // Crear la cita
    const appointment = Appointment.create(clientId, providerId, reason, startTime, endTime, notes);

    if (!appointment.isValid()) {
      throw AppError.badRequest('Error al crear la cita');
    }

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Obtener una cita por ID
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw AppError.notFound('Cita no encontrada');
    }

    return appointment;
  }

  /**
   * Listar citas de un cliente
   */
  async listAppointmentsByClient(
    clientId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const appointments = await this.appointmentRepository.findByClientId(clientId);
    const paginated = appointments.slice(offset, offset + limit);

    return {
      appointments: paginated,
      total: appointments.length,
    };
  }

  /**
   * Listar citas de un proveedor
   */
  async listAppointmentsByProvider(
    providerId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const appointments = await this.appointmentRepository.findByProviderId(providerId);
    const paginated = appointments.slice(offset, offset + limit);

    return {
      appointments: paginated,
      total: appointments.length,
    };
  }

  /**
   * Obtener citas próximas de un cliente
   */
  async getUpcomingAppointmentsByClient(clientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findUpcomingByClient(clientId);
  }

  /**
   * Obtener citas próximas de un proveedor
   */
  async getUpcomingAppointmentsByProvider(providerId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findUpcomingByProvider(providerId);
  }

  /**
   * Reagendar una cita
   */
  async rescheduleAppointment(
    appointmentId: string,
    newStartTime: Date,
    newEndTime: Date
  ): Promise<Appointment> {
    const appointment = await this.getAppointmentById(appointmentId);

    // Verificar que se puede reagendar
    if (!appointment.canBeCancelled()) {
      throw AppError.badRequest('La cita no puede ser reagendada en este estado');
    }

    // Verificar conflictos con el nuevo horario
    const hasConflict = await this.appointmentRepository.hasConflict(
      appointment.providerId,
      newStartTime,
      newEndTime,
      appointmentId
    );

    if (hasConflict) {
      throw AppError.conflict('El proveedor tiene una cita en el nuevo horario');
    }

    // Actualizar la cita
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.updatedAt = new Date();

    const updated = await this.appointmentRepository.update(appointmentId, appointment);
    if (!updated) {
      throw AppError.internalServer('Error al reagendar la cita');
    }

    return updated;
  }

  /**
   * Cancelar una cita
   */
  async cancelAppointment(
    appointmentId: string,
    cancelledBy: string,
    reason: string
  ): Promise<Appointment> {
    const appointment = await this.getAppointmentById(appointmentId);

    // Verificar que se puede cancelar
    if (!appointment.canBeCancelled()) {
      throw AppError.badRequest('La cita no puede ser cancelada en este estado');
    }

    // Cancelar la cita
    appointment.cancel(cancelledBy, reason);

    const updated = await this.appointmentRepository.update(appointmentId, appointment);
    if (!updated) {
      throw AppError.internalServer('Error al cancelar la cita');
    }

    return updated;
  }

  /**
   * Confirmar una cita
   */
  async confirmAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = await this.getAppointmentById(appointmentId);

    if (appointment.status !== AppointmentStatus.PENDING) {
      throw AppError.badRequest('Solo se pueden confirmar citas en estado PENDING');
    }

    appointment.confirm();

    const updated = await this.appointmentRepository.update(appointmentId, appointment);
    if (!updated) {
      throw AppError.internalServer('Error al confirmar la cita');
    }

    return updated;
  }

  /**
   * Completar una cita
   */
  async completeAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = await this.getAppointmentById(appointmentId);

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw AppError.badRequest('Solo se pueden completar citas confirmadas');
    }

    appointment.complete();

    const updated = await this.appointmentRepository.update(appointmentId, appointment);
    if (!updated) {
      throw AppError.internalServer('Error al completar la cita');
    }

    return updated;
  }

  /**
   * Marcar una cita como NO ASISTIDA
   */
  async markAsNoShow(appointmentId: string): Promise<Appointment> {
    const appointment = await this.getAppointmentById(appointmentId);

    appointment.markNoShow();

    const updated = await this.appointmentRepository.update(appointmentId, appointment);
    if (!updated) {
      throw AppError.internalServer('Error al marcar la cita como no asistida');
    }

    return updated;
  }

  /**
   * Obtener estadísticas de un proveedor
   */
  async getProviderStats(providerId: string): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    upcomingAppointments: number;
  }> {
    const all = await this.appointmentRepository.findByProviderId(providerId);
    const completed = await this.appointmentRepository.findCompletedByProvider(providerId);
    const cancelled = await this.appointmentRepository.findCancelledByProvider(providerId);
    const upcoming = await this.appointmentRepository.findUpcomingByProvider(providerId);

    return {
      totalAppointments: all.length,
      completedAppointments: completed.length,
      cancelledAppointments: cancelled.length,
      upcomingAppointments: upcoming.length,
    };
  }

  /**
   * Obtener estadísticas de un cliente
   */
  async getClientStats(clientId: string): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    upcomingAppointments: number;
  }> {
    const all = await this.appointmentRepository.findByClientId(clientId);
    const completed = await this.appointmentRepository.findCompletedByClient(clientId);
    const upcoming = await this.appointmentRepository.findUpcomingByClient(clientId);
    const cancelled = all.filter((a) => a.status === AppointmentStatus.CANCELLED);

    return {
      totalAppointments: all.length,
      completedAppointments: completed.length,
      cancelledAppointments: cancelled.length,
      upcomingAppointments: upcoming.length,
    };
  }

  /**
   * Buscar citas por rango de fechas
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.appointmentRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Buscar citas por estado
   */
  async findByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    return this.appointmentRepository.findByStatus(status);
  }
}
