import { Router } from 'express';
import { TimeSlotController } from '../controllers/TimeSlotController';
import { TimeSlotService } from '@application/services/TimeSlotService';
import { TimeSlotRepository } from '@infrastructure/database/repositories/TimeSlotRepository';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Inyección de dependencias
const timeSlotRepository = new TimeSlotRepository();
const timeSlotService = new TimeSlotService(timeSlotRepository);
const timeSlotController = new TimeSlotController(timeSlotService);

/**
 * POST /timeslots
 * Crear un nuevo horario de disponibilidad
 * Body: { providerId, dayOfWeek, startTime, endTime, maxAppointments? }
 */
router.post('/', authMiddleware, timeSlotController.createTimeSlot);

/**
 * GET /timeslots/:id
 * Obtener un horario por ID
 */
router.get('/:id', authMiddleware, timeSlotController.getTimeSlotById);

/**
 * GET /timeslots/provider/:providerId
 * Listar horarios de un proveedor
 */
router.get('/provider/:providerId', authMiddleware, timeSlotController.listTimeSlotsByProvider);

/**
 * GET /timeslots/provider/:providerId/available
 * Obtener horarios disponibles de un proveedor
 */
router.get(
  '/provider/:providerId/available',
  authMiddleware,
  timeSlotController.getAvailableTimeSlots
);

/**
 * GET /timeslots/provider/:providerId/day/:dayOfWeek
 * Obtener horarios disponibles por día de la semana
 */
router.get(
  '/provider/:providerId/day/:dayOfWeek',
  authMiddleware,
  timeSlotController.getAvailableTimeSlotsByDay
);

/**
 * GET /timeslots/provider/:providerId/stats
 * Obtener estadísticas de horarios de un proveedor
 */
router.get(
  '/provider/:providerId/stats',
  authMiddleware,
  timeSlotController.getProviderTimeSlotStats
);

/**
 * PUT /timeslots/:id/block
 * Bloquear un horario
 * Body: { reason? }
 */
router.put('/:id/block', authMiddleware, timeSlotController.blockTimeSlot);

/**
 * PUT /timeslots/:id/unblock
 * Desbloquear un horario
 */
router.put('/:id/unblock', authMiddleware, timeSlotController.unblockTimeSlot);

/**
 * DELETE /timeslots/:id
 * Eliminar un horario
 */
router.delete('/:id', authMiddleware, timeSlotController.deleteTimeSlot);

export default router;
