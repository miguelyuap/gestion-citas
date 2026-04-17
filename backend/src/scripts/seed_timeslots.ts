import { AppDataSource } from '../config/database';
import { TimeSlotEntity } from '../infrastructure/database/entities/TimeSlotEntity';
import { ProviderEntity } from '../infrastructure/database/entities/ProviderEntity';
import { TimeSlotStatus } from '../domain/enums/TimeSlotStatus';

async function seedTimeSlots() {
    try {
        console.log('🌱 Starting TimeSlots seed...');
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const timeSlotRepository = AppDataSource.getRepository(TimeSlotEntity);
        const providerRepository = AppDataSource.getRepository(ProviderEntity);

        // Find the test provider (Consultorio Magno)
        const provider = await providerRepository.findOne({
            where: { businessName: 'Consultorio Magno' }
        });

        if (!provider) {
            console.error('❌ Test provider "Consultorio Magno" not found. Run seed.ts first.');
            return;
        }

        console.log(`👨‍⚕️ Generando horarios para: ${provider.businessName} (Provider ID: ${provider.id})`);

        // Clear existing slots for this provider
        const existingSlots = await timeSlotRepository.find({
            where: { providerId: provider.id }
        });

        if (existingSlots.length > 0) {
            console.log(`🧹 Removing ${existingSlots.length} existing slots...`);
            await timeSlotRepository.remove(existingSlots);
        }

        const slots: TimeSlotEntity[] = [];

        // Create recurring slots for Monday (1) to Friday (5)
        for (let day = 1; day <= 5; day++) {

            // Create slots from 9:00 AM to 5:00 PM (17:00), every hour
            for (let hour = 9; hour < 17; hour++) {
                // Lunch break at 1:00 PM (13:00)
                if (hour === 13) continue;

                const startTime = `${hour.toString().padStart(2, '0')}:00`;
                const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

                const slot = new TimeSlotEntity();
                slot.providerId = provider.id; // Use Provider ID, not User ID
                slot.dayOfWeek = day;
                slot.startTime = startTime;
                slot.endTime = endTime;
                slot.status = TimeSlotStatus.AVAILABLE;
                slot.maxAppointments = 1;
                slot.appointmentsBooked = 0;
                slot.isRecurring = true;
                slot.createdAt = new Date();
                slot.updatedAt = new Date();

                slots.push(slot);
            }
        }

        await timeSlotRepository.save(slots);
        console.log(`✅ ${slots.length} time slots created successfully for Provider ID: ${provider.id}`);

    } catch (error) {
        console.error('❌ TimeSlots Seed failed:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seedTimeSlots();
