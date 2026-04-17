import { DataSource } from 'typeorm';
import { UserEntity } from '../../src/infrastructure/database/entities/UserEntity';
import { ProviderEntity } from '../../src/infrastructure/database/entities/ProviderEntity';
import { AppointmentEntity } from '../../src/infrastructure/database/entities/AppointmentEntity';
import { TimeSlotEntity } from '../../src/infrastructure/database/entities/TimeSlotEntity';
import { AppointmentService } from '../../src/application/services/AppointmentService';
import { AppointmentRepository } from '../../src/infrastructure/database/repositories/AppointmentRepository';
import { TimeSlotRepository } from '../../src/infrastructure/database/repositories/TimeSlotRepository';
import { UserRole } from '../../src/domain/enums/UserRole';

describe('Appointment Flow Integration', () => {
    let dataSource: DataSource;
    let appointmentService: AppointmentService;

    beforeAll(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            entities: [UserEntity, ProviderEntity, AppointmentEntity, TimeSlotEntity],
        });
        await dataSource.initialize();

        const appointmentRepo = new AppointmentRepository(dataSource.getRepository(AppointmentEntity));
        const timeSlotRepo = new TimeSlotRepository(dataSource.getRepository(TimeSlotEntity));
        appointmentService = new AppointmentService(appointmentRepo, timeSlotRepo);
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('should complete a full appointment booking flow', async () => {
        const userRepo = dataSource.getRepository(UserEntity);
        const providerRepo = dataSource.getRepository(ProviderEntity);

        // 1. Create a provider user
        const providerUser = userRepo.create({
            email: 'provider@test.com',
            password: 'hashedpassword',
            firstName: 'Dr.',
            lastName: 'Test',
            phone: '123456789',
            role: UserRole.PROVIDER
        });
        await userRepo.save(providerUser);

        const provider = providerRepo.create({
            userId: providerUser.id,
            businessName: 'Test Clinic',
            specialty: 'General',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            phone: '123456789'
        });
        await providerRepo.save(provider);

        // 2. Create a client user
        const clientUser = userRepo.create({
            email: 'client@test.com',
            password: 'hashedpassword',
            firstName: 'John',
            lastName: 'Doe',
            phone: '987654321',
            role: UserRole.CLIENT
        });

        // UserEntity is not an active record, use repo.
        await userRepo.save(clientUser);

        // 3. Define future dates
        const startTime = new Date();
        startTime.setFullYear(startTime.getFullYear() + 1);
        startTime.setHours(10, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(11, 0, 0, 0);

        // 4. Create appointment via service
        const appointment = await appointmentService.createAppointment(
            clientUser.id,
            provider.id,
            'Routine Checkup',
            startTime,
            endTime,
            'Please be on time'
        );

        // 5. Verify appointment was saved
        expect(appointment).toBeDefined();
        expect(appointment.id).toBeDefined();
        expect(appointment.clientId).toBe(clientUser.id);

        const savedAppt = await dataSource.getRepository(AppointmentEntity).findOne({
            where: { id: appointment.id }
        });
        expect(savedAppt).toBeDefined();
        expect(savedAppt?.serviceType).toBe('Routine Checkup');
    });
});
