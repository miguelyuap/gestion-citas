import { AppointmentService } from '../../src/application/services/AppointmentService';
import { IAppointmentRepository } from '../../src/domain/interfaces/IAppointmentRepository';
import { ITimeSlotRepository } from '../../src/domain/interfaces/ITimeSlotRepository';
import { Appointment } from '../../src/domain/entities/Appointment';
import { AppointmentStatus } from '../../src/domain/enums/AppointmentStatus';
import { AppError } from '../../src/shared/utils/AppError';

// Mock Appointment entity
jest.mock('../../src/domain/entities/Appointment', () => {
    return {
        Appointment: {
            create: jest.fn().mockImplementation((clientId, providerId, serviceType, startTime, endTime, notes) => {
                const appt = {
                    clientId, providerId, serviceType, startTime, endTime, notes,
                    status: 'PENDING',
                    isValid: jest.fn().mockReturnValue(true),
                    canBeCancelled: jest.fn().mockReturnValue(true),
                    confirm: jest.fn(),
                    cancel: jest.fn(),
                    complete: jest.fn(),
                };
                return appt;
            })
        }
    };
});

describe('AppointmentService', () => {
    let appointmentService: AppointmentService;
    let mockAppointmentRepo: jest.Mocked<IAppointmentRepository>;
    let mockTimeSlotRepo: jest.Mocked<ITimeSlotRepository>;

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0);

    const endTime = new Date(futureDate);
    endTime.setHours(11, 0, 0);

    const mockAppointment = {
        id: 'appt-1',
        clientId: 'client-1',
        providerId: 'provider-1',
        serviceType: 'Consultation',
        startTime,
        endTime,
        status: AppointmentStatus.PENDING,
        isValid: () => true,
        canBeCancelled: () => true,
    } as unknown as Appointment;

    beforeEach(() => {
        mockAppointmentRepo = {
            save: jest.fn(),
            findById: jest.fn(),
            findByClientId: jest.fn(),
            findByProviderId: jest.fn(),
            findUpcomingByClient: jest.fn(),
            findUpcomingByProvider: jest.fn(),
            hasConflict: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findCompletedByProvider: jest.fn(),
            findCancelledByProvider: jest.fn(),
            findCompletedByClient: jest.fn(),
            findByDateRange: jest.fn(),
            findByStatus: jest.fn(),
        } as any;

        mockTimeSlotRepo = {
            findById: jest.fn(),
            findByProviderId: jest.fn(),
            save: jest.fn(),
        } as any;

        appointmentService = new AppointmentService(mockAppointmentRepo, mockTimeSlotRepo);
    });

    describe('createAppointment', () => {
        it('should create an appointment successfully', async () => {
            mockAppointmentRepo.hasConflict.mockResolvedValue(false);
            mockAppointmentRepo.save.mockResolvedValue(mockAppointment);

            const result = await appointmentService.createAppointment(
                'client-1',
                'provider-1',
                'Consultation',
                startTime,
                endTime
            );

            expect(mockAppointmentRepo.hasConflict).toHaveBeenCalled();
            expect(mockAppointmentRepo.save).toHaveBeenCalled();
            expect(result).toEqual(mockAppointment);
        });

        it('should throw error if required fields are missing', async () => {
            await expect(appointmentService.createAppointment('', '', '', startTime, endTime))
                .rejects.toThrow('clientId, providerId y reason son requeridos');
        });

        it('should throw error if startTime is after endTime', async () => {
            await expect(appointmentService.createAppointment('c', 'p', 'r', endTime, startTime))
                .rejects.toThrow('La hora de inicio debe ser anterior a la hora de fin');
        });

        it('should throw error if date is in the past', async () => {
            const pastDate = new Date();
            pastDate.setFullYear(pastDate.getFullYear() - 1);
            await expect(appointmentService.createAppointment('c', 'p', 'r', pastDate, startTime))
                .rejects.toThrow('No se pueden crear citas en el pasado');
        });

        it('should throw conflict error if provider is busy', async () => {
            mockAppointmentRepo.hasConflict.mockResolvedValue(true);

            await expect(appointmentService.createAppointment('c', 'p', 'r', startTime, endTime))
                .rejects.toThrow('El proveedor tiene una cita en ese horario');
        });
    });

    describe('getAppointmentById', () => {
        it('should return appointment if found', async () => {
            mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
            const result = await appointmentService.getAppointmentById('appt-1');
            expect(result).toEqual(mockAppointment);
        });

        it('should throw not found error if not found', async () => {
            mockAppointmentRepo.findById.mockResolvedValue(null);
            await expect(appointmentService.getAppointmentById('invalid'))
                .rejects.toThrow('Cita no encontrada');
        });
    });

    describe('rescheduleAppointment', () => {
        it('should reschedule successfully', async () => {
            mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
            mockAppointmentRepo.hasConflict.mockResolvedValue(false);
            mockAppointmentRepo.update.mockResolvedValue({ ...mockAppointment, startTime: endTime } as any);

            const result = await appointmentService.rescheduleAppointment('appt-1', endTime, new Date());
            expect(mockAppointmentRepo.update).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });
});
