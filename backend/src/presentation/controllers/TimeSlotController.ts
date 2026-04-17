import { Request, Response, NextFunction } from 'express';
import { TimeSlotService } from '@application/services/TimeSlotService';
import { TimeSlotMapper } from '@infrastructure/database/mappers/TimeSlotMapper';
import { ApiResponse } from '@shared/utils/ApiResponse';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * Controlador de Horarios (TimeSlots)
 * Maneja las solicitudes HTTP relacionadas con disponibilidad de horarios
 */
export class TimeSlotController {
  constructor(private timeSlotService: TimeSlotService) {}

  /**
   * Crear un nuevo horario de disponibilidad
   * POST /timeslots
   */
  createTimeSlot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { providerId, dayOfWeek, startTime, endTime, maxAppointments } = req.body;

      const timeSlot = await this.timeSlotService.createTimeSlot(
        providerId,
        dayOfWeek,
        startTime,
        endTime,
        maxAppointments
      );

      const dto = TimeSlotMapper.toDTO(timeSlot);
      res.status(201).json(ApiResponse.success('Horario creado exitosamente', dto));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener un horario por ID
   * GET /timeslots/:id
   */
  getTimeSlotById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const timeSlot = await this.timeSlotService.getTimeSlotById(id);
      const dto = TimeSlotMapper.toDTO(timeSlot);

      res.status(200).json(ApiResponse.success('Horario obtenido', dto));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Listar horarios de un proveedor
   * GET /timeslots/provider/:providerId
   */
  listTimeSlotsByProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { providerId } = req.params;

      const timeSlots = await this.timeSlotService.listTimeSlotsByProvider(providerId);
      const dtos = timeSlots.map((slot) => TimeSlotMapper.toDTO(slot));

      res.status(200).json(ApiResponse.success('Horarios del proveedor', dtos));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener horarios disponibles de un proveedor
   * GET /timeslots/provider/:providerId/available
   */
  getAvailableTimeSlots = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { providerId } = req.params;

      const timeSlots = await this.timeSlotService.getAvailableTimeSlots(providerId);
      const dtos = timeSlots.map((slot) => TimeSlotMapper.toDTO(slot));

      res.status(200).json(ApiResponse.success('Horarios disponibles', dtos));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener horarios disponibles por día de la semana
   * GET /timeslots/provider/:providerId/day/:dayOfWeek
   */
  getAvailableTimeSlotsByDay = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { providerId, dayOfWeek } = req.params;

      const timeSlots = await this.timeSlotService.getAvailableTimeSlotsByDay(
        providerId,
        Number(dayOfWeek)
      );
      const dtos = timeSlots.map((slot) => TimeSlotMapper.toDTO(slot));

      res.status(200).json(ApiResponse.success('Horarios disponibles por día', dtos));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bloquear un horario
   * PUT /timeslots/:id/block
   */
  blockTimeSlot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const timeSlot = await this.timeSlotService.blockTimeSlot(id, reason);
      const dto = TimeSlotMapper.toDTO(timeSlot);

      res.status(200).json(ApiResponse.success('Horario bloqueado exitosamente', dto));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Desbloquear un horario
   * PUT /timeslots/:id/unblock
   */
  unblockTimeSlot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const timeSlot = await this.timeSlotService.unblockTimeSlot(id);
      const dto = TimeSlotMapper.toDTO(timeSlot);

      res.status(200).json(ApiResponse.success('Horario desbloqueado exitosamente', dto));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar un horario
   * DELETE /timeslots/:id
   */
  deleteTimeSlot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await this.timeSlotService.deleteTimeSlot(id);
      res.status(200).json(ApiResponse.success('Horario eliminado exitosamente'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener estadísticas de horarios de un proveedor
   * GET /timeslots/provider/:providerId/stats
   */
  getProviderTimeSlotStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { providerId } = req.params;

      const stats = await this.timeSlotService.getProviderTimeSlotStats(providerId);
      res.status(200).json(ApiResponse.success('Estadísticas de horarios', stats));
    } catch (error) {
      next(error);
    }
  };
}
