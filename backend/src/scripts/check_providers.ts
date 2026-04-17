import { AppDataSource } from '../config/database';
import { ProviderEntity } from '../infrastructure/database/entities/ProviderEntity';
import { UserEntity } from '../infrastructure/database/entities/UserEntity';

async function checkProviders() {
    try {
        await AppDataSource.initialize();

        const providerRepository = AppDataSource.getRepository(ProviderEntity);
        const userRepository = AppDataSource.getRepository(UserEntity);

        const doctor = await userRepository.findOne({ where: { email: 'doctor@test.com' } });
        console.log('Doctor User ID:', doctor?.id);

        const providers = await providerRepository.find();
        console.log('\nProviders in DB:', providers.length);
        providers.forEach(p => {
            console.log({
                id: p.id,
                userId: p.userId,
                businessName: p.businessName
            });
        });

    } catch (error: any) {
        console.error('ERROR:', error.message);
    } finally {
        await AppDataSource.destroy();
    }
}

checkProviders();
