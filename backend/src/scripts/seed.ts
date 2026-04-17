import { AppDataSource } from '../config/database';
import { UserEntity } from '../infrastructure/database/entities/UserEntity';
import { ProviderEntity } from '../infrastructure/database/entities/ProviderEntity';
import { UserRole } from '../domain/enums/UserRole';
import * as bcrypt from 'bcryptjs';

async function seed() {
    try {
        console.log('🌱 Starting seed...');
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepository = AppDataSource.getRepository(UserEntity);
        const providerRepository = AppDataSource.getRepository(ProviderEntity);

        // 1. Create Provider User
        const existingUser = await userRepository.findOneBy({ email: 'doctor@test.com' });
        if (existingUser) {
            console.log('⚠️ Test provider already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Using explicit object that matches UserEntity
        const providerUser = new UserEntity();
        providerUser.firstName = 'Alejandro';
        providerUser.lastName = 'Magno';
        providerUser.email = 'doctor@test.com';
        providerUser.password = hashedPassword;
        providerUser.phone = '+573001234567';
        providerUser.role = UserRole.PROVIDER;
        providerUser.active = true;
        providerUser.emailVerified = true;
        providerUser.createdAt = new Date();
        providerUser.updatedAt = new Date();

        const savedUser = await userRepository.save(providerUser);
        console.log('✅ User created:', savedUser.email);

        // 2. Create Provider Profile
        const providerProfile = new ProviderEntity();
        providerProfile.userId = savedUser.id;
        providerProfile.businessName = 'Consultorio Magno';
        providerProfile.specialty = 'Cardiología';
        providerProfile.description = 'Especialista en corazón y cirugía cardiovascular con 15 años de experiencia.';
        providerProfile.address = 'Calle 123 # 45-67';
        providerProfile.city = 'Bogotá';
        providerProfile.state = 'Bogotá D.C.';
        providerProfile.zipCode = '110111';
        providerProfile.phone = '+573001234567';
        providerProfile.rating = 4.8;
        providerProfile.totalReviews = 10;
        providerProfile.isVerified = true;
        providerProfile.isActive = true;
        providerProfile.createdAt = new Date();
        providerProfile.updatedAt = new Date();

        await providerRepository.save(providerProfile);
        console.log('✅ Provider profile created');

        console.log('✨ Seed completed successfully');
    } catch (error) {
        console.error('❌ Seed failed:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seed();
