import { TimeSlotStatus } from '../enums/TimeSlotStatus';

/**
 * Entidad de Dominio: Disponibilidad de Tiempo
 * Representa los horarios disponibles de un proveedor
 */
export class TimeSlot {
  public id!: string;
  public providerId!: string;
  public dayOfWeek!: number; // 0 = Domingo, 6 = Sábado
  public startTime!: string; // HH:mm
  public endTime!: string; // HH:mm
  public status!: TimeSlotStatus;
  public maxAppointments!: number;
  public appointmentsBooked!: number;
  public notes!: string | null;
  public isRecurring!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  /**
   * Constructor privado para forzar uso de método factory
   */
  private constructor() {}

  /**
   * Método factory para crear una nueva instancia de TimeSlot
   */
  public static create(
    providerId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    maxAppointments: number = 1
  ): TimeSlot {
    const timeSlot = new TimeSlot();
    timeSlot.providerId = providerId;
    timeSlot.dayOfWeek = dayOfWeek;
    timeSlot.startTime = startTime;
    timeSlot.endTime = endTime;
    timeSlot.status = TimeSlotStatus.AVAILABLE;
    timeSlot.maxAppointments = maxAppointments;
    timeSlot.appointmentsBooked = 0;
    timeSlot.notes = null;
    timeSlot.isRecurring = true;
    timeSlot.createdAt = new Date();
    timeSlot.updatedAt = new Date();
    return timeSlot;
  }

  /**
   * Valida que el TimeSlot tenga todos los campos requeridos
   */
  public isValid(): boolean {
    return (
      this.providerId.length > 0 &&
      this.dayOfWeek >= 0 &&
      this.dayOfWeek <= 6 &&
      this.isValidTimeFormat(this.startTime) &&
      this.isValidTimeFormat(this.endTime) &&
      this.startTime < this.endTime &&
      this.maxAppointments > 0
    );
  }

  /**
   * Verifica si el formato de hora es válido (HH:mm)
   */
  private isValidTimeFormat(time: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  }

  /**
   * Verifica si el slot está disponible
   */
  public isAvailable(): boolean {
    return (
      this.status === TimeSlotStatus.AVAILABLE &&
      this.appointmentsBooked < this.maxAppointments
    );
  }

  /**
   * Intenta hacer una reserva
   */
  public bookAppointment(): boolean {
    if (this.isAvailable()) {
      this.appointmentsBooked += 1;
      this.updatedAt = new Date();

      // Si se alcanzó el máximo, cambiar estado
      if (this.appointmentsBooked >= this.maxAppointments) {
        this.status = TimeSlotStatus.BOOKED;
      }
      return true;
    }
    return false;
  }

  /**
   * Cancela una reserva
   */
  public cancelBooking(): boolean {
    if (this.appointmentsBooked > 0) {
      this.appointmentsBooked -= 1;
      this.updatedAt = new Date();

      // Si vuelve a estar disponible, actualizar estado
      if (this.appointmentsBooked < this.maxAppointments) {
        this.status = TimeSlotStatus.AVAILABLE;
      }
      return true;
    }
    return false;
  }

  /**
   * Bloquea el slot (mantenimiento, vacaciones, etc)
   */
  public block(): void {
    this.status = TimeSlotStatus.BLOCKED;
    this.appointmentsBooked = this.maxAppointments;
    this.updatedAt = new Date();
  }

  /**
   * Desbloquea el slot
   */
  public unblock(): void {
    this.status = TimeSlotStatus.AVAILABLE;
    this.appointmentsBooked = 0;
    this.updatedAt = new Date();
  }

  /**
   * Obtiene el nombre del día de la semana
   */
  public getDayName(): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[this.dayOfWeek];
  }

  /**
   * Calcula la duración del slot en minutos
   */
  public getDurationMinutes(): number {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    return endTotal - startTotal;
  }
}
