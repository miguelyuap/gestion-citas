import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '@application/services/AppointmentService';
import { AppointmentMapper } from '@infrastructure/database/mappers/AppointmentMapper';
import { ApiResponse } from '@shared/utils/ApiResponse';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * Controlador de Citas
 * Maneja las solicitudes HTTP relacionadas con citas
 */
export class AppointmentController {
  constructor(
    private appointmentService: AppointmentService
  ) {}

  /**
   * Crear una nueva cita
   * POST /appointments
   */
  createAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user!.id;
      const { providerId, startTime, endTime, serviceType, notes } = req.body;

      const appointment = await this.appointmentService.createAppointment(
        userId,
        providerId,
        serviceType,
        new Date(startTime),
        new Date(endTime),
        notes
      );

      const dto = AppointmentMapper.toDTO(appointment);
      res.status(201).json(ApiResponse.success('Cita creada exitosamente', dto));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener una cita por ID
   * GET /appointments/:id
   */
  getAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const appointment = await this.appointmentService.getAppointmentById(id);
      const dto = AppointmentMapper.toDTO(appointment);

      res.status(200).json(ApiResponse.success('Cita obtenida', dto));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Listar citas del cliente autenticado
   * GET /appointments/my-appointments
   */
  listMyAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user!.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.appointmentService.listAppointmentsByClient(
        userId,
        Number(page),
        Number(limit)
      );

      const dtos = result.appointments.map((apt) => AppointmentMapper.toDTO(apt));
      res.status(200).json(ApiResponse.success('Citas del cliente', {
        appointments: dtos,
        total: result.total
      }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Listar citas de un proveedor
   * GET /appointments/provider/:providerId
   */
  listAppointmentsByProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { providerId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.appointmentService.listAppointmentsByProvider(
        providerId,
        Number(page),
        Number(limit)
      );

      const dtos = result.appointments.map((apt) => AppointmentMapper.toDTO(apt));
      res.status(200).json(ApiResponse.success('Citas del proveedor', {
        appointments: dtos,
        total: result.total
      }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener citas próximas del cliente autenticado
   * GET /appointments/upcoming/client
   */
  getUpcomingAppointmentsAsClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user!.id;

      const appointments = await this.appointmentService.getUpcomingAppointmentsByClient(userId);
      const dtos = appointments.map((apt) => AppointmentMapper.toDTO(apt));

      res.status(200).json(ApiResponse.success('Citas próximas', dtos));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reagendar una cita
   * PUT /appointments/:id/reschedule
   */
  rescheduleAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { startTime, endTime } = req.body;

      const appointment = await this.appointmentService.rescheduleAppointment(
        id,
        startTime,
        endTime
      );

      const dto = AppointmentMapper.toDTO(appointment);
      res.status(200).json(ApiResponse.success('Cita reagendada exitosamente', dto));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancelar una cita
   * PUT /appointments/:id/cancel
   */
  cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const cancelledBy = (req as AuthRequest).user!.id;

      const appointment = await this.appointmentService.cancelAppointment(id, cancelledBy, reason);
      const dto = AppointmentMapper.toDTO(appointment);

      res.status(200).json(ApiResponse.success('Cita cancelada exitosamente', dto));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Confirmar una cita
   * PUT /appointments/:id/confirm
   */
  confirmAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const appointment = await this.appointmentService.confirmAppointment(id);
      const dto = AppointmentMapper.toDTO(appointment);

      res.status(200).json(ApiResponse.success('Cita confirmada exitosamente', dto));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Completar una cita
   * PUT /appointments/:id/complete
   */
  completeAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const appointment = await this.appointmentService.completeAppointment(id);
      const dto = AppointmentMapper.toDTO(appointment);

      res.status(200).json(ApiResponse.success('Cita completada exitosamente', dto));
    } catch (error) {
      next(error);
    }
  };
}
