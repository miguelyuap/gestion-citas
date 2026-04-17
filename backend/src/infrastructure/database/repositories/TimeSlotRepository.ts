import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { TimeSlot } from '@domain/entities/TimeSlot';
import { TimeSlotStatus } from '@domain/enums/TimeSlotStatus';
import { ITimeSlotRepository } from '@domain/interfaces/ITimeSlotRepository';
import { TimeSlotEntity } from '../entities/TimeSlotEntity';
import { TimeSlotMapper } from '../mappers/TimeSlotMapper';
import { AppError } from '@shared/utils/AppError';

/**
 * TimeSlotRepository
 * Implementa la interfaz ITimeSlotRepository
 * Maneja todas las operaciones de BD relacionadas con Slots de Tiempo
 */
export class TimeSlotRepository implements ITimeSlotRepository {
  private ormRepository: Repository<TimeSlotEntity>;

  constructor(repository?: Repository<TimeSlotEntity>) {
    this.ormRepository = repository || AppDataSource.getRepository(TimeSlotEntity);
  }

  /**
   * Encontrar TimeSlot por ID
   */
  async findById(id: string): Promise<TimeSlot | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!entity) {
      return null;
    }

    return TimeSlotMapper.toDomain(entity);
  }

  /**
   * Encontrar TimeSlots por proveedor y día
   * En esta implementación, buscamos por fecha
   */
  async findByProviderAndDay(providerId: string, dayOfWeek: number): Promise<TimeSlot[]> {
    const entities = await this.ormRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.providerId = :providerId', { providerId })
      .leftJoinAndSelect('timeSlot.provider', 'provider')
      .orderBy('timeSlot.startTime', 'ASC')
      .getMany();

    return entities
      .map((entity: TimeSlotEntity) => TimeSlotMapper.toDomain(entity))
      .filter((slot: TimeSlot) => slot.dayOfWeek === dayOfWeek);
  }

  /**
   * Encontrar TimeSlots por proveedor
   */
  async findByProviderId(providerId: string): Promise<TimeSlot[]> {
    const entities = await this.ormRepository.find({
      where: { providerId },
      relations: ['provider'],
      order: { startTime: 'ASC' },
    });

    return entities.map((entity: TimeSlotEntity) => TimeSlotMapper.toDomain(entity));
  }

  /**
   * Obtener todos los TimeSlots
   */
  async findAll(limit: number = 10, offset: number = 0): Promise<TimeSlot[]> {
    const entities = await this.ormRepository.find({
      relations: ['provider'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
      take: limit,
      skip: offset,
    });

    return entities.map((entity: TimeSlotEntity) => TimeSlotMapper.toDomain(entity));
  }

  /**
   * Encontrar TimeSlots disponibles (todos los slots AVAILABLE)
   */
  async findAvailable(providerId: string): Promise<TimeSlot[]> {
    const entities = await this.ormRepository.find({
      where: {
        providerId,
        status: TimeSlotStatus.AVAILABLE,
      },
      relations: ['provider'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });

    return entities.map((entity: TimeSlotEntity) => TimeSlotMapper.toDomain(entity));
  }

  /**
   * Encontrar TimeSlots disponibles para un día específico
   */
  async findAvailableByDay(providerId: string, dayOfWeek: number): Promise<TimeSlot[]> {
    const entities = await this.ormRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.providerId = :providerId', { providerId })
      .andWhere('timeSlot.status = :status', { status: TimeSlotStatus.AVAILABLE })
      .leftJoinAndSelect('timeSlot.provider', 'provider')
      .orderBy('timeSlot.startTime', 'ASC')
      .getMany();

    return entities
      .map((entity: TimeSlotEntity) => TimeSlotMapper.toDomain(entity))
      .filter((slot: TimeSlot) => slot.dayOfWeek === dayOfWeek);
  }

  /**
   * Guardar un nuevo TimeSlot
   */
  async save(timeSlot: TimeSlot): Promise<TimeSlot> {
    const entity = TimeSlotMapper.toPersistence(timeSlot) as TimeSlotEntity;

    const savedEntity = await this.ormRepository.save(entity);

    // Recargar las relaciones
    const loadedEntity = await this.ormRepository.findOne({
      where: { id: savedEntity.id },
      relations: ['provider'],
    });

    if (!loadedEntity) {
      throw AppError.internalServer('Error al guardar el slot de tiempo');
    }

    return TimeSlotMapper.toDomain(loadedEntity);
  }

  /**
   * Actualizar un TimeSlot existente
   */
  async update(id: string, timeSlot: Partial<TimeSlot>): Promise<TimeSlot | null> {
    // Buscar el timeSlot existente
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    // Fusionar cambios
    const updated = { ...existing, ...timeSlot };

    // Actualizar directamente en BD
    await this.ormRepository.update(id, {
      providerId: updated.providerId,
      startTime: updated.startTime,
      endTime: updated.endTime,
      status: updated.status,
      notes: updated.notes,
      updatedAt: new Date(),
    } as any);

    // Recargar y retornar
    return this.findById(id);
  }

  /**
   * Eliminar un TimeSlot
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.ormRepository.softDelete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Contar TimeSlots totales
   */
  async count(): Promise<number> {
    return this.ormRepository.count();
  }

  /**
   * Obtener TimeSlots por estado
   */
  async findByStatus(status: TimeSlotStatus): Promise<TimeSlot[]> {
    const entities = await this.ormRepository.find({
      where: { status },
      relations: ['provider'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });

    return entities.map((entity: TimeSlotEntity) => TimeSlotMapper.toDomain(entity));
  }

  /**
   * Verificar disponibilidad en un horario específico
   */
  async isSlotAvailable(providerId: string, dayOfWeek: number, startTime: string): Promise<boolean> {
    const availableSlots = await this.findAvailableByDay(providerId, dayOfWeek);
    return availableSlots.some((slot: TimeSlot) => slot.startTime === startTime);
  }

  /**
   * Buscar slots por proveedor y estado
   */
  async findByProviderAndStatus(providerId: string, status: TimeSlotStatus): Promise<TimeSlot[]> {
    const entities = await this.ormRepository.find({
      where: { providerId, status },
      relations: ['provider'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });

    return entities.map((entity: TimeSlotEntity) => TimeSlotMapper.toDomain(entity));
  }

  /**
   * Marcar slot como reservado
   */
  async markAsBooked(id: string): Promise<TimeSlot | null> {
    const timeSlot = await this.findById(id);
    if (!timeSlot) {
      return null;
    }

    // Incrementar contador
    if (timeSlot.bookAppointment()) {
      return this.update(id, timeSlot);
    }

    return null;
  }

  /**
   * Marcar slot como disponible
   */
  async markAsAvailable(id: string): Promise<TimeSlot | null> {
    const timeSlot = await this.findById(id);
    if (!timeSlot) {
      return null;
    }

    timeSlot.status = TimeSlotStatus.AVAILABLE;
    timeSlot.appointmentsBooked = 0;
    return this.update(id, timeSlot);
  }

  /**
   * Marcar slot como bloqueado (mantenimiento)
   */
  async markAsBlocked(id: string): Promise<TimeSlot | null> {
    const timeSlot = await this.findById(id);
    if (!timeSlot) {
      return null;
    }

    timeSlot.status = TimeSlotStatus.BLOCKED;
    return this.update(id, timeSlot);
  }

  /**
   * Obtener slots bloqueados de un proveedor en un día
   */
  async findBlockedSlots(providerId: string, dayOfWeek: number): Promise<TimeSlot[]> {
    const entities = await this.ormRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.providerId = :providerId', { providerId })
      .andWhere('timeSlot.status = :status', { status: TimeSlotStatus.BLOCKED })
      .leftJoinAndSelect('timeSlot.provider', 'provider')
      .orderBy('timeSlot.startTime', 'ASC')
      .getMany();

    return entities
      .map((entity: TimeSlotEntity) => TimeSlotMapper.toDomain(entity))
      .filter((slot: TimeSlot) => slot.dayOfWeek === dayOfWeek);
  }

  /**
   * Contar slots disponibles de un proveedor
   */
  async countAvailableByProvider(providerId: string): Promise<number> {
    return this.ormRepository.count({
      where: {
        providerId,
        status: TimeSlotStatus.AVAILABLE,
      },
    });
  }

  /**
   * Crear múltiples slots (bulk create)
   */
  async bulkCreate(timeSlots: TimeSlot[]): Promise<TimeSlot[]> {
    const entities = timeSlots.map((slot) => TimeSlotMapper.toPersistence(slot) as TimeSlotEntity);
    const savedEntities = await this.ormRepository.save(entities);

    // Recargar con relaciones
    const withRelations = await Promise.all(
      savedEntities.map((entity) =>
        this.ormRepository.findOne({
          where: { id: entity.id },
          relations: ['provider'],
        })
      )
    );

    return withRelations.map((entity) => (entity ? TimeSlotMapper.toDomain(entity) : null)).filter(Boolean) as TimeSlot[];
  }

  /**
   * Encontrar TimeSlots para un rango de fechas (para agenda semanal)
   */
  async findByWeekDays(providerId: string, startDay: number, endDay: number): Promise<TimeSlot[]> {
    const entities = await this.ormRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.providerId = :providerId', { providerId })
      .leftJoinAndSelect('timeSlot.provider', 'provider')
      .orderBy('timeSlot.dayOfWeek', 'ASC')
      .addOrderBy('timeSlot.startTime', 'ASC')
      .getMany();

    return entities
      .map((entity: TimeSlotEntity) => TimeSlotMapper.toDomain(entity))
      .filter((slot: TimeSlot) => slot.dayOfWeek >= startDay && slot.dayOfWeek <= endDay);
  }
}
