import { AppDataSource } from '../config/database';
import { TimeSlotEntity } from '../infrastructure/database/entities/TimeSlotEntity';

async function cleanTimeSlots() {
    try {
        console.log('🧹 Cleaning all TimeSlots...');
        await AppDataSource.initialize();

        const timeSlotRepository = AppDataSource.getRepository(TimeSlotEntity);

        const allSlots = await timeSlotRepository.find();
        console.log(`Found ${allSlots.length} slots to delete`);

        await timeSlotRepository.remove(allSlots);
        console.log('✅ All TimeSlots deleted');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await AppDataSource.destroy();
    }
}

cleanTimeSlots();
