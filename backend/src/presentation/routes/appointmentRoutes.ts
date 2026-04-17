import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { AppointmentService } from '@application/services/AppointmentService';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Instanciar servicios y controlador
const appointmentService = new AppointmentService();
const appointmentController = new AppointmentController(appointmentService);

/**
 * POST /appointments
 * Crear una nueva cita
 * Body: { providerId, startTime, endTime, serviceType, notes? }
 */
router.post('/', authMiddleware, appointmentController.createAppointment);

/**
 * GET /appointments/:id
 * Obtener una cita por ID
 */
router.get('/:id', authMiddleware, appointmentController.getAppointmentById);

/**
 * GET /appointments/my-appointments
 * Listar citas del cliente autenticado (paginadas)
 */
router.get('/my-appointments', authMiddleware, appointmentController.listMyAppointments);

/**
 * GET /appointments/provider/:providerId
 * Listar citas de un proveedor (paginadas)
 */
router.get('/provider/:providerId', authMiddleware, appointmentController.listAppointmentsByProvider);

/**
 * GET /appointments/upcoming/client
 * Obtener citas próximas del cliente autenticado
 */
router.get('/upcoming/client', authMiddleware, appointmentController.getUpcomingAppointmentsAsClient);

/**
 * PUT /appointments/:id/reschedule
 * Reagendar una cita
 * Body: { startTime, endTime }
 */
router.put('/:id/reschedule', authMiddleware, appointmentController.rescheduleAppointment);

/**
 * PUT /appointments/:id/cancel
 * Cancelar una cita
 * Body: { reason? }
 */
router.put('/:id/cancel', authMiddleware, appointmentController.cancelAppointment);

/**
 * PUT /appointments/:id/confirm
 * Confirmar una cita
 */
router.put('/:id/confirm', authMiddleware, appointmentController.confirmAppointment);

/**
 * PUT /appointments/:id/complete
 * Completar una cita
 */
router.put('/:id/complete', authMiddleware, appointmentController.completeAppointment);

export default router;
