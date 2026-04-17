import { AppDataSource } from '../config/database';
import { TimeSlotEntity } from '../infrastructure/database/entities/TimeSlotEntity';
import { UserEntity } from '../infrastructure/database/entities/UserEntity';
import { ProviderEntity } from '../infrastructure/database/entities/ProviderEntity';

async function checkData() {
    try {
        await AppDataSource.initialize();

        const timeSlotRepository = AppDataSource.getRepository(TimeSlotEntity);
        const userRepository = AppDataSource.getRepository(UserEntity);

        const providerRepository = AppDataSource.getRepository(ProviderEntity);

        const doctorUser = await userRepository.findOne({ where: { email: 'doctor@test.com' } });
        console.log('Doctor User ID:', doctorUser?.id);

        const provider = await providerRepository.findOne({ where: { userId: doctorUser?.id } });
        console.log('Provider Profile ID:', provider?.id);

        const slots = await timeSlotRepository.find({ where: { providerId: provider?.id }, take: 2 });
        console.log('Slots found:', slots.length);
        if (slots.length > 0) {
            console.log('First slot:', JSON.stringify(slots[0], null, 2));
        }

    } catch (error: any) {
        console.error('ERROR:', error.message);
    } finally {
        await AppDataSource.destroy();
    }
}

checkData();
