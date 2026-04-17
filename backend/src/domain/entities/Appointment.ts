import { AppointmentStatus } from '../enums/AppointmentStatus';

/**
 * Entidad de Dominio: Cita
 * Representa una cita agendada en el sistema
 */
export class Appointment {
  public id!: string;
  public clientId!: string;
  public providerId!: string;
  public serviceType!: string;
  public startTime!: Date;
  public endTime!: Date;
  public status!: AppointmentStatus;
  public notes!: string | null;
  public cancellationReason!: string | null;
  public cancelledBy!: string | null; // userId de quien canceló
  public cancelledAt!: Date | null;
  public completedAt!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  /**
   * Constructor privado para forzar uso de método factory
   */
  private constructor() {}

  /**
   * Método factory para crear una nueva instancia de Cita
   */
  public static create(
    clientId: string,
    providerId: string,
    serviceType: string,
    startTime: Date,
    endTime: Date,
    notes?: string
  ): Appointment {
    const appointment = new Appointment();
    appointment.clientId = clientId;
    appointment.providerId = providerId;
    appointment.serviceType = serviceType;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.status = AppointmentStatus.PENDING;
    appointment.notes = notes || null;
    appointment.cancellationReason = null;
    appointment.cancelledBy = null;
    appointment.cancelledAt = null;
    appointment.completedAt = null;
    appointment.createdAt = new Date();
    appointment.updatedAt = new Date();
    return appointment;
  }

  /**
   * Valida que la cita tenga todos los campos requeridos
   */
  public isValid(): boolean {
    return (
      this.clientId.length > 0 &&
      this.providerId.length > 0 &&
      this.serviceType.length > 0 &&
      this.startTime < this.endTime &&
      this.startTime > new Date()
    );
  }

  /**
   * Confirma la cita
   */
  public confirm(): void {
    if (this.status === AppointmentStatus.PENDING) {
      this.status = AppointmentStatus.CONFIRMED;
      this.updatedAt = new Date();
    }
  }

  /**
   * Cancela la cita
   */
  public cancel(cancelledBy: string, reason: string): void {
    if (this.canBeCancelled()) {
      this.status = AppointmentStatus.CANCELLED;
      this.cancelledBy = cancelledBy;
      this.cancellationReason = reason;
      this.cancelledAt = new Date();
      this.updatedAt = new Date();
    }
  }

  /**
   * Marca la cita como completada
   */
  public complete(): void {
    if (this.status === AppointmentStatus.CONFIRMED) {
      this.status = AppointmentStatus.COMPLETED;
      this.completedAt = new Date();
      this.updatedAt = new Date();
    }
  }

  /**
   * Marca la cita como no asistida
   */
  public markNoShow(): void {
    if (this.status === AppointmentStatus.CONFIRMED && new Date() > this.startTime) {
      this.status = AppointmentStatus.NO_SHOW;
      this.updatedAt = new Date();
    }
  }

  /**
   * Verifica si la cita puede ser cancelada
   */
  public canBeCancelled(): boolean {
    return (
      (this.status === AppointmentStatus.PENDING ||
        this.status === AppointmentStatus.CONFIRMED) &&
      new Date() < this.startTime
    );
  }

  /**
   * Verifica si la cita está vigente
   */
  public isUpcoming(): boolean {
    return new Date() < this.startTime && this.status !== AppointmentStatus.CANCELLED;
  }

  /**
   * Calcula la duración de la cita en minutos
   */
  public getDuration(): number {
    return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }
}
