import { TimeSlotService } from '../../src/application/services/TimeSlotService';
import { ITimeSlotRepository } from '../../src/domain/interfaces/ITimeSlotRepository';
import { TimeSlot } from '../../src/domain/entities/TimeSlot';
import { TimeSlotStatus } from '../../src/domain/enums/TimeSlotStatus';
import { AppError } from '../../src/shared/utils/AppError';

// Mock TimeSlot entity
jest.mock('../../src/domain/entities/TimeSlot', () => {
    return {
        TimeSlot: {
            create: jest.fn().mockImplementation((providerId, dayOfWeek, startTime, endTime, maxAppointments) => {
                return {
                    providerId, dayOfWeek, startTime, endTime, maxAppointments,
                    status: 'AVAILABLE',
                    appointmentsBooked: 0,
                    isValid: jest.fn().mockReturnValue(true),
                };
            })
        }
    };
});

describe('TimeSlotService', () => {
    let timeSlotService: TimeSlotService;
    let mockTimeSlotRepo: jest.Mocked<ITimeSlotRepository>;

    const mockTimeSlot = {
        id: 'slot-1',
        providerId: 'provider-1',
        dayOfWeek: 1, // Lunes
        startTime: '09:00',
        endTime: '10:00',
        status: TimeSlotStatus.AVAILABLE,
        maxAppointments: 1,
        appointmentsBooked: 0,
    } as unknown as TimeSlot;

    beforeEach(() => {
        mockTimeSlotRepo = {
            save: jest.fn(),
            findById: jest.fn(),
            findByProviderId: jest.fn(),
            findAvailableByDay: jest.fn(),
            findAvailable: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            isSlotAvailable: jest.fn(),
            findByStatus: jest.fn(),
        } as any;

        timeSlotService = new TimeSlotService(mockTimeSlotRepo);
    });

    describe('createTimeSlot', () => {
        it('should create a time slot successfully', async () => {
            mockTimeSlotRepo.save.mockResolvedValue(mockTimeSlot);

            const result = await timeSlotService.createTimeSlot(
                'provider-1',
                1,
                '09:00',
                '10:00'
            );

            expect(mockTimeSlotRepo.save).toHaveBeenCalled();
            expect(result).toEqual(mockTimeSlot);
        });

        it('should throw error for invalid time format', async () => {
            await expect(timeSlotService.createTimeSlot('p', 1, '9:00', '10:00'))
                .rejects.toThrow('Formato de tiempo inválido: 9:00. Use HH:mm');
        });

        it('should throw error if startTime >= endTime', async () => {
            await expect(timeSlotService.createTimeSlot('p', 1, '11:00', '10:00'))
                .rejects.toThrow('La hora de inicio debe ser menor a la hora de finalización');
        });

        it('should throw error for invalid day of week', async () => {
            await expect(timeSlotService.createTimeSlot('p', 7, '09:00', '10:00'))
                .rejects.toThrow('El día de la semana debe estar entre 0 (domingo) y 6 (sábado)');
        });
    });

    describe('markAsBooked', () => {
        it('should mark as booked successfully', async () => {
            mockTimeSlotRepo.findById.mockResolvedValue(mockTimeSlot);
            mockTimeSlotRepo.update.mockResolvedValue({ ...mockTimeSlot, status: TimeSlotStatus.BOOKED, appointmentsBooked: 1 } as any);

            const result = await timeSlotService.markAsBooked('slot-1');
            expect(mockTimeSlotRepo.update).toHaveBeenCalledWith('slot-1', expect.objectContaining({ status: TimeSlotStatus.BOOKED }));
            expect(result.status).toBe(TimeSlotStatus.BOOKED);
        });

        it('should throw error if slot is not available', async () => {
            mockTimeSlotRepo.findById.mockResolvedValue({ ...mockTimeSlot, status: TimeSlotStatus.BOOKED } as any);

            await expect(timeSlotService.markAsBooked('slot-1'))
                .rejects.toThrow('El horario no está disponible');
        });
    });

    describe('deleteTimeSlot', () => {
        it('should delete successfully', async () => {
            mockTimeSlotRepo.findById.mockResolvedValue(mockTimeSlot);
            mockTimeSlotRepo.delete.mockResolvedValue(true as any);

            await timeSlotService.deleteTimeSlot('slot-1');
            expect(mockTimeSlotRepo.delete).toHaveBeenCalledWith('slot-1');
        });

        it('should throw error if slot is booked', async () => {
            mockTimeSlotRepo.findById.mockResolvedValue({ ...mockTimeSlot, status: TimeSlotStatus.BOOKED } as any);

            await expect(timeSlotService.deleteTimeSlot('slot-1'))
                .rejects.toThrow('No se puede eliminar un horario reservado');
        });
    });
});
