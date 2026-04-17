import { Appointment } from '../entities/Appointment';
import { AppointmentStatus } from '../enums/AppointmentStatus';

/**
 * Interfaz para el repositorio de Citas
 * Define el contrato que todo repositorio de Appointment debe cumplir
 */
export interface IAppointmentRepository {
  /**
   * Encontrar cita por ID
   */
  findById(id: string): Promise<Appointment | null>;

  /**
   * Encontrar citas por cliente
   */
  findByClientId(clientId: string): Promise<Appointment[]>;

  /**
   * Encontrar citas por proveedor
   */
  findByProviderId(providerId: string): Promise<Appointment[]>;

  /**
   * Encontrar citas por rango de fechas
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;

  /**
   * Encontrar citas por estado
   */
  findByStatus(status: AppointmentStatus): Promise<Appointment[]>;

  /**
   * Obtener todas las citas
   */
  findAll(limit?: number, offset?: number): Promise<Appointment[]>;

  /**
   * Guardar una nueva cita
   */
  save(appointment: Appointment): Promise<Appointment>;

  /**
   * Actualizar una cita existente
   */
  update(id: string, appointment: Partial<Appointment>): Promise<Appointment | null>;

  /**
   * Eliminar una cita
   */
  delete(id: string): Promise<boolean>;

  /**
   * Contar citas totales
   */
  count(): Promise<number>;

  /**
   * Verificar si existe conflicto de horario
   */
  hasConflict(
    providerId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string
  ): Promise<boolean>;

  /**
   * Obtener citas próximas de un cliente
   */
  findUpcomingByClient(clientId: string): Promise<Appointment[]>;

  /**
   * Obtener citas próximas de un proveedor
   */
  findUpcomingByProvider(providerId: string): Promise<Appointment[]>;

  /**
   * Obtener citas finalizadas de un cliente
   */
  findCompletedByClient(clientId: string): Promise<Appointment[]>;

  /**
   * Obtener citas finalizadas de un proveedor
   */
  findCompletedByProvider(providerId: string): Promise<Appointment[]>;

  /**
   * Obtener citas canceladas de un proveedor
   */
  findCancelledByProvider(providerId: string): Promise<Appointment[]>;

  /**
   * Contar citas de un cliente
   */
  countByClient(clientId: string): Promise<number>;

  /**
   * Contar citas de un proveedor
   */
  countByProvider(providerId: string): Promise<number>;

  /**
   * Contar citas completadas de un proveedor
   */
  countCompletedByProvider(providerId: string): Promise<number>;
}
