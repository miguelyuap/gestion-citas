import { TimeSlot } from '../entities/TimeSlot';
import { TimeSlotStatus } from '../enums/TimeSlotStatus';

/**
 * Interfaz para el repositorio de TimeSlots
 * Define el contrato que todo repositorio de TimeSlot debe cumplir
 */
export interface ITimeSlotRepository {
  /**
   * Encontrar TimeSlot por ID
   */
  findById(id: string): Promise<TimeSlot | null>;

  /**
   * Encontrar TimeSlots por proveedor y día
   */
  findByProviderAndDay(providerId: string, dayOfWeek: number): Promise<TimeSlot[]>;

  /**
   * Encontrar TimeSlots por proveedor
   */
  findByProviderId(providerId: string): Promise<TimeSlot[]>;

  /**
   * Obtener todos los TimeSlots
   */
  findAll(limit?: number, offset?: number): Promise<TimeSlot[]>;

  /**
   * Encontrar TimeSlots disponibles
   */
  findAvailable(providerId: string): Promise<TimeSlot[]>;

  /**
   * Encontrar TimeSlots disponibles para un día específico
   */
  findAvailableByDay(providerId: string, dayOfWeek: number): Promise<TimeSlot[]>;

  /**
   * Guardar un nuevo TimeSlot
   */
  save(timeSlot: TimeSlot): Promise<TimeSlot>;

  /**
   * Actualizar un TimeSlot existente
   */
  update(id: string, timeSlot: Partial<TimeSlot>): Promise<TimeSlot | null>;

  /**
   * Eliminar un TimeSlot
   */
  delete(id: string): Promise<boolean>;

  /**
   * Contar TimeSlots totales
   */
  count(): Promise<number>;

  /**
   * Obtener TimeSlots por estado
   */
  findByStatus(status: TimeSlotStatus): Promise<TimeSlot[]>;

  /**
   * Verificar disponibilidad en un horario específico
   */
  isSlotAvailable(providerId: string, dayOfWeek: number, startTime: string): Promise<boolean>;
}
