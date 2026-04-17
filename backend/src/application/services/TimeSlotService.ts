import { TimeSlot } from '@domain/entities/TimeSlot';
import { TimeSlotStatus } from '@domain/enums/TimeSlotStatus';
import { ITimeSlotRepository } from '@domain/interfaces/ITimeSlotRepository';
import { AppError } from '@shared/utils/AppError';

/**
 * Servicio de TimeSlot
 * Gestiona la disponibilidad de horarios de los proveedores
 */
export class TimeSlotService {
  constructor(private readonly timeSlotRepository: ITimeSlotRepository) {}

  /**
   * Crear un nuevo horario de disponibilidad
   */
  async createTimeSlot(
    providerId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    maxAppointments: number = 1
  ): Promise<TimeSlot> {
    // Validar formato de tiempo HH:mm
    this.validateTimeFormat(startTime);
    this.validateTimeFormat(endTime);

    // Validar que startTime < endTime
    if (!this.isValidTimeRange(startTime, endTime)) {
      throw AppError.badRequest('La hora de inicio debe ser menor a la hora de finalización');
    }

    // Validar dayOfWeek (0-6)
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw AppError.badRequest('El día de la semana debe estar entre 0 (domingo) y 6 (sábado)');
    }

    // Crear el TimeSlot
    const timeSlot = TimeSlot.create(providerId, dayOfWeek, startTime, endTime, maxAppointments);

    const created = await this.timeSlotRepository.save(timeSlot);
    return created;
  }

  /**
   * Obtener un horario por ID
   */
  async getTimeSlotById(timeSlotId: string): Promise<TimeSlot> {
    const timeSlot = await this.timeSlotRepository.findById(timeSlotId);

    if (!timeSlot) {
      throw AppError.notFound('Horario no encontrado');
    }

    return timeSlot;
  }

  /**
   * Listar todos los horarios de un proveedor
   */
  async listTimeSlotsByProvider(providerId: string): Promise<TimeSlot[]> {
    const timeSlots = await this.timeSlotRepository.findByProviderId(providerId);
    return timeSlots;
  }

  /**
   * Obtener horarios disponibles de un proveedor por día de la semana
   */
  async getAvailableTimeSlotsByDay(
    providerId: string,
    dayOfWeek: number
  ): Promise<TimeSlot[]> {
    const timeSlots = await this.timeSlotRepository.findAvailableByDay(providerId, dayOfWeek);
    return timeSlots;
  }

  /**
   * Obtener todos los horarios disponibles de un proveedor
   */
  async getAvailableTimeSlots(providerId: string): Promise<TimeSlot[]> {
    const timeSlots = await this.timeSlotRepository.findAvailable(providerId);
    return timeSlots;
  }

  /**
   * Marcar un horario como reservado
   */
  async markAsBooked(timeSlotId: string): Promise<TimeSlot> {
    const timeSlot = await this.getTimeSlotById(timeSlotId);

    if (timeSlot.status !== TimeSlotStatus.AVAILABLE) {
      throw AppError.badRequest('El horario no está disponible');
    }

    const updated = await this.timeSlotRepository.update(timeSlotId, {
      status: TimeSlotStatus.BOOKED,
      appointmentsBooked: (timeSlot.appointmentsBooked || 0) + 1,
      updatedAt: new Date()
    });

    if (!updated) {
      throw AppError.internalServer('Error al marcar el horario como reservado');
    }

    return updated;
  }

  /**
   * Marcar un horario como disponible
   */
  async markAsAvailable(timeSlotId: string): Promise<TimeSlot> {
    const timeSlot = await this.getTimeSlotById(timeSlotId);

    const updated = await this.timeSlotRepository.update(timeSlotId, {
      status: TimeSlotStatus.AVAILABLE,
      appointmentsBooked: Math.max(0, (timeSlot.appointmentsBooked || 0) - 1),
      updatedAt: new Date()
    });

    if (!updated) {
      throw AppError.internalServer('Error al marcar el horario como disponible');
    }

    return updated;
  }

  /**
   * Bloquear un horario
   */
  async blockTimeSlot(timeSlotId: string, reason?: string): Promise<TimeSlot> {
    const timeSlot = await this.getTimeSlotById(timeSlotId);

    const updatedNotes = reason ? `BLOQUEADO: ${reason}` : 'BLOQUEADO';

    const updated = await this.timeSlotRepository.update(timeSlotId, {
      status: TimeSlotStatus.BLOCKED,
      notes: updatedNotes,
      updatedAt: new Date()
    });

    if (!updated) {
      throw AppError.internalServer('Error al bloquear el horario');
    }

    return updated;
  }

  /**
   * Desbloquear un horario
   */
  async unblockTimeSlot(timeSlotId: string): Promise<TimeSlot> {
    const timeSlot = await this.getTimeSlotById(timeSlotId);

    if (timeSlot.status !== TimeSlotStatus.BLOCKED) {
      throw AppError.badRequest('El horario no está bloqueado');
    }

    const updated = await this.timeSlotRepository.update(timeSlotId, {
      status: TimeSlotStatus.AVAILABLE,
      notes: null,
      updatedAt: new Date()
    });

    if (!updated) {
      throw AppError.internalServer('Error al desbloquear el horario');
    }

    return updated;
  }

  /**
   * Eliminar un horario
   */
  async deleteTimeSlot(timeSlotId: string): Promise<void> {
    const timeSlot = await this.getTimeSlotById(timeSlotId);

    // No se pueden eliminar horarios reservados
    if (timeSlot.status === TimeSlotStatus.BOOKED) {
      throw AppError.badRequest('No se puede eliminar un horario reservado');
    }

    await this.timeSlotRepository.delete(timeSlotId);
  }

  /**
   * Verificar si un horario específico está disponible
   */
  async isSlotAvailable(
    providerId: string,
    dayOfWeek: number,
    startTime: string
  ): Promise<boolean> {
    return await this.timeSlotRepository.isSlotAvailable(providerId, dayOfWeek, startTime);
  }

  /**
   * Obtener horarios bloqueados de un proveedor
   */
  async getBlockedTimeSlots(providerId: string): Promise<TimeSlot[]> {
    const allTimeSlots = await this.timeSlotRepository.findByProviderId(providerId);
    return allTimeSlots.filter((slot) => slot.status === TimeSlotStatus.BLOCKED);
  }

  /**
   * Contar horarios disponibles de un proveedor
   */
  async countAvailableSlots(providerId: string): Promise<number> {
    const availableSlots = await this.timeSlotRepository.findAvailable(providerId);
    return availableSlots.length;
  }

  /**
   * Obtener TimeSlots por estado
   */
  async getTimeSlotsByStatus(status: TimeSlotStatus): Promise<TimeSlot[]> {
    return await this.timeSlotRepository.findByStatus(status);
  }

  /**
   * Actualizar un horario
   */
  async updateTimeSlot(
    timeSlotId: string,
    updates: {
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      maxAppointments?: number;
      isRecurring?: boolean;
    }
  ): Promise<TimeSlot> {
    const timeSlot = await this.getTimeSlotById(timeSlotId);

    // No se pueden actualizar horarios reservados
    if (timeSlot.status === TimeSlotStatus.BOOKED) {
      throw AppError.badRequest('No se puede actualizar un horario reservado');
    }

    // Validar y actualizar startTime si se proporciona
    if (updates.startTime) {
      this.validateTimeFormat(updates.startTime);
      const endTime = updates.endTime || timeSlot.endTime;
      if (!this.isValidTimeRange(updates.startTime, endTime)) {
        throw AppError.badRequest('Rango de tiempo inválido');
      }
    }

    // Validar y actualizar endTime si se proporciona
    if (updates.endTime) {
      this.validateTimeFormat(updates.endTime);
      const startTime = updates.startTime || timeSlot.startTime;
      if (!this.isValidTimeRange(startTime, updates.endTime)) {
        throw AppError.badRequest('Rango de tiempo inválido');
      }
    }

    // Validar dayOfWeek si se proporciona
    if (updates.dayOfWeek !== undefined && (updates.dayOfWeek < 0 || updates.dayOfWeek > 6)) {
      throw AppError.badRequest('El día de la semana debe estar entre 0 (domingo) y 6 (sábado)');
    }

    const updated = await this.timeSlotRepository.update(timeSlotId, {
      ...updates,
      updatedAt: new Date()
    });

    if (!updated) {
      throw AppError.internalServer('Error al actualizar el horario');
    }

    return updated;
  }

  /**
   * Obtener estadísticas de horarios de un proveedor
   */
  async getProviderTimeSlotStats(providerId: string): Promise<{
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
    blockedSlots: number;
  }> {
    const allSlots = await this.timeSlotRepository.findByProviderId(providerId);

    const totalSlots = allSlots.length;
    const availableSlots = allSlots.filter((slot) => slot.status === TimeSlotStatus.AVAILABLE)
      .length;
    const bookedSlots = allSlots.filter((slot) => slot.status === TimeSlotStatus.BOOKED).length;
    const blockedSlots = allSlots.filter((slot) => slot.status === TimeSlotStatus.BLOCKED)
      .length;

    return {
      totalSlots,
      availableSlots,
      bookedSlots,
      blockedSlots
    };
  }

  /**
   * Validar formato de tiempo HH:mm
   */
  private validateTimeFormat(time: string): void {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw AppError.badRequest(`Formato de tiempo inválido: ${time}. Use HH:mm`);
    }
  }

  /**
   * Validar que startTime < endTime
   */
  private isValidTimeRange(startTime: string, endTime: string): boolean {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    return startTotalMin < endTotalMin;
  }
}

