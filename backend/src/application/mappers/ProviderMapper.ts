import { ProviderEntity } from '../../infrastructure/database/entities/ProviderEntity';
import { Provider } from '@domain/entities/Provider';

export class ProviderMapper {
  static toDomain(raw: ProviderEntity): Provider {
    const provider = Provider.create(
      raw.userId,
      raw.businessName || (raw.user?.firstName ? `${raw.user.firstName} ${raw.user.lastName}` : 'Unknown Business'),
      raw.specialty,
      raw.address || '',
      raw.city || '',
      raw.state || '',
      raw.zipCode || '',
      raw.phone || ''
    );

    // Sobrescribimos con los datos específicos de la entidad Provider
    provider.id = raw.id;
    provider.businessName = raw.user?.firstName ? `${raw.user.firstName} ${raw.user.lastName}` : 'Unknown'; // O usar un campo businessName si existiera en ProviderEntity
    provider.description = raw.description || '';
    provider.website = raw.website || null;
    provider.rating = Number(raw.rating);
    provider.totalReviews = raw.totalReviews;
    provider.isVerified = raw.isVerified;
    provider.isActive = raw.isActive;
    provider.createdAt = raw.createdAt;
    provider.updatedAt = raw.updatedAt;

    return provider;
  }

  static toPersistence(provider: Provider): Partial<ProviderEntity> {
    return {
      userId: provider.userId,
      specialty: provider.specialty,
      description: provider.description,
      website: provider.website || undefined,
      rating: provider.rating,
      totalReviews: provider.totalReviews,
      isVerified: provider.isVerified,
      isActive: provider.isActive,
    };
  }

  static toDTO(provider: Provider) {
    return {
      id: provider.id,
      userId: provider.userId,
      businessName: provider.businessName,
      specialty: provider.specialty,
      rating: provider.rating,
      isVerified: provider.isVerified,
      city: provider.city,
      description: provider.description
    };
  }
}