import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { Appointment } from '@domain/entities/Appointment';
import { AppointmentStatus } from '@domain/enums/AppointmentStatus';
import { IAppointmentRepository } from '@domain/interfaces/IAppointmentRepository';
import { AppointmentEntity } from '../entities/AppointmentEntity';
import { AppointmentMapper } from '../mappers/AppointmentMapper';
import { AppError } from '@shared/utils/AppError';

/**
 * AppointmentRepository
 * Implementa la interfaz IAppointmentRepository
 * Maneja todas las operaciones de BD relacionadas con Citas
 */
export class AppointmentRepository implements IAppointmentRepository {
  private ormRepository: Repository<AppointmentEntity>;

  constructor(repository?: Repository<AppointmentEntity>) {
    this.ormRepository = repository || AppDataSource.getRepository(AppointmentEntity);
  }

  /**
   * Encontrar cita por ID
   */
  async findById(id: string): Promise<Appointment | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
      relations: ['client', 'provider'],
    });

    if (!entity) {
      return null;
    }

    return AppointmentMapper.toDomain(entity);
  }

  /**
   * Encontrar citas por cliente
   */
  async findByClientId(clientId: string): Promise<Appointment[]> {
    const entities = await this.ormRepository.find({
      where: { clientId },
      relations: ['client', 'provider'],
      order: { startTime: 'DESC' },
    });

    return entities.map((entity: AppointmentEntity) => AppointmentMapper.toDomain(entity));
  }

  /**
   * Encontrar citas por proveedor
   */
  async findByProviderId(providerId: string): Promise<Appointment[]> {
    const entities = await this.ormRepository.find({
      where: { providerId },
      relations: ['client', 'provider'],
      order: { startTime: 'DESC' },
    });

    return entities.map((entity: AppointmentEntity) => AppointmentMapper.toDomain(entity));
  }

  /**
   * Encontrar citas por rango de fechas
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const entities = await this.ormRepository
      .createQueryBuilder('appointment')
      .where('appointment.startTime >= :startDate', { startDate })
      .andWhere('appointment.startTime <= :endDate', { endDate })
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.provider', 'provider')
      .orderBy('appointment.startTime', 'ASC')
      .getMany();

    return entities.map((entity: AppointmentEntity) => AppointmentMapper.toDomain(entity));
  }

  /**
   * Encontrar citas por estado
   */
  async findByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    const entities = await this.ormRepository.find({
      where: { status },
      relations: ['client', 'provider'],
      order: { startTime: 'DESC' },
    });

    return entities.map((entity: AppointmentEntity) => AppointmentMapper.toDomain(entity));
  }

  /**
   * Obtener todas las citas (paginadas)
   */
  async findAll(limit: number = 10, offset: number = 0): Promise<Appointment[]> {
    const entities = await this.ormRepository.find({
      relations: ['client', 'provider'],
      order: { startTime: 'DESC' },
      take: limit,
      skip: offset,
    });

    return entities.map((entity: AppointmentEntity) => AppointmentMapper.toDomain(entity));
  }

  /**
   * Guardar una nueva cita
   */
  async save(appointment: Appointment): Promise<Appointment> {
    const entity = AppointmentMapper.toPersistence(appointment) as AppointmentEntity;

    const savedEntity = await this.ormRepository.save(entity);

    // Recargar las relaciones
    const loadedEntity = await this.ormRepository.findOne({
      where: { id: savedEntity.id },
      relations: ['client', 'provider'],
    });

    if (!loadedEntity) {
      throw AppError.internalServer('Error al guardar la cita');
    }

    return AppointmentMapper.toDomain(loadedEntity);
  }

  /**
   * Actualizar una cita existente
   */
  async update(id: string, appointment: Partial<Appointment>): Promise<Appointment | null> {
    // Buscar la cita existente
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    // Fusionar cambios
    const updated = { ...existing, ...appointment };

    // Actualizar directamente en BD
    await this.ormRepository.update(id, {
      clientId: updated.clientId,
      providerId: updated.providerId,
      serviceType: updated.serviceType,
      startTime: updated.startTime,
      endTime: updated.endTime,
      status: updated.status,
      notes: updated.notes,
      cancellationReason: updated.cancellationReason,
      cancelledAt: updated.cancelledAt,
      completedAt: updated.completedAt,
      updatedAt: new Date(),
    } as any);

    // Recargar y retornar
    return this.findById(id);
  }

  /**
   * Eliminar una cita (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.ormRepository.softDelete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Contar citas totales
   */
  async count(): Promise<number> {
    return this.ormRepository.count();
  }

  /**
   * Verificar si existe conflicto de horario
   * Un conflicto existe cuando hay dos citas del mismo proveedor que se solapan en tiempo
   */
  async hasConflict(
    providerId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const query = this.ormRepository
      .createQueryBuilder('appointment')
      .where('appointment.providerId = :providerId', { providerId })
      .andWhere('appointment.status != :cancelledStatus', { cancelledStatus: AppointmentStatus.CANCELLED })
      .andWhere('appointment.status != :noShowStatus', { noShowStatus: AppointmentStatus.NO_SHOW })
      .andWhere(
        '(appointment.startTime < :endTime AND appointment.endTime > :startTime)',
        {
          startTime,
          endTime,
        }
      );

    // Si se proporciona ID para excluir, lo hacemos
    if (excludeAppointmentId) {
      query.andWhere('appointment.id != :excludeId', { excludeId: excludeAppointmentId });
    }

    const conflict = await query.getOne();
    return !!conflict;
  }

  /**
   * Obtener citas próximas de un cliente
   */
  async findUpcomingByClient(clientId: string): Promise<Appointment[]> {
    const now = new Date();
    const entities = await this.ormRepository
      .createQueryBuilder('appointment')
      .where('appointment.clientId = :clientId', { clientId })
      .andWhere('appointment.startTime > :now', { now })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      })
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.provider', 'provider')
      .orderBy('appointment.startTime', 'ASC')
      .getMany();

    return entities.map((entity: AppointmentEntity) => AppointmentMapper.toDomain(entity));
  }

  /**
   * Obtener citas próximas de un proveedor
   */
  async findUpcomingByProvider(providerId: string): Promise<Appointment[]> {
    const now = new Date();
    const entities = await this.ormRepository
      .createQueryBuilder('appointment')
      .where('appointment.providerId = :providerId', { providerId })
      .andWhere('appointment.startTime > :now', { now })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      })
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.provider', 'provider')
      .orderBy('appointment.startTime', 'ASC')
      .getMany();

    return entities.map((entity: AppointmentEntity) => AppointmentMapper.toDomain(entity));
  }

  /**
   * Obtener citas finalizadas de un cliente
   */
  async findCompletedByClient(clientId: string): Promise<Appointment[]> {
    const entities = await this.ormRepository.find({
      where: {
        clientId,
        status: AppointmentStatus.COMPLETED,
      },
      relations: ['client', 'provider'],
      order: { completedAt: 'DESC' },
    });

    return entities.map((entity: AppointmentEntity) => AppointmentMapper.toDomain(entity));
  }

  /**
   * Obtener citas finalizadas de un proveedor
   */
  async findCompletedByProvider(providerId: string): Promise<Appointment[]> {
    const entities = await this.ormRepository.find({
      where: {
        providerId,
        status: AppointmentStatus.COMPLETED,
      },
      relations: ['client', 'provider'],
      order: { completedAt: 'DESC' },
    });

    return entities.map((entity: AppointmentEntity) => AppointmentMapper.toDomain(entity));
  }

  /**
   * Obtener citas canceladas
   */
  async findCancelledByProvider(providerId: string): Promise<Appointment[]> {
    const entities = await this.ormRepository.find({
      where: {
        providerId,
        status: AppointmentStatus.CANCELLED,
      },
      relations: ['client', 'provider'],
      order: { cancelledAt: 'DESC' },
    });

    return entities.map((entity: AppointmentEntity) => AppointmentMapper.toDomain(entity));
  }

  /**
   * Contar citas de un cliente
   */
  async countByClient(clientId: string): Promise<number> {
    return this.ormRepository.count({
      where: { clientId },
    });
  }

  /**
   * Contar citas de un proveedor
   */
  async countByProvider(providerId: string): Promise<number> {
    return this.ormRepository.count({
      where: { providerId },
    });
  }

  /**
   * Contar citas completadas de un proveedor
   */
  async countCompletedByProvider(providerId: string): Promise<number> {
    return this.ormRepository.count({
      where: {
        providerId,
        status: AppointmentStatus.COMPLETED,
      },
    });
  }

  /**
   * Formatea una fecha a formato HH:mm
   */
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Calcula la duración en minutos entre dos fechas
   */
  private calculateDuration(startTime: Date, endTime: Date): number {
    return Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }
}
