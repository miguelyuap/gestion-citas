import { IProviderRepository } from '@domain/interfaces/IProviderRepository';
import { Provider } from '@domain/entities/Provider';
import { AppError } from '@shared/utils/AppError';
import { CreateProviderDTO, UpdateProviderDTO, SearchProviderDTO } from '@application/dtos/ProviderDTO';

export class ProviderService {
  constructor(private providerRepository: IProviderRepository) { }

  async createProvider(dto: CreateProviderDTO): Promise<Provider> {
    const existing = await this.providerRepository.findByUserId(dto.userId);
    if (existing) throw AppError.conflict('El usuario ya es un proveedor');

    const provider = Provider.create(
      dto.userId,
      dto.businessName,
      dto.specialty,
      dto.address,
      dto.city,
      dto.state,
      dto.zipCode,
      dto.phone
    );

    if (dto.description) provider.description = dto.description;
    if (dto.website) provider.website = dto.website;

    return this.providerRepository.save(provider);
  }

  async getProviderById(id: string): Promise<Provider> {
    const provider = await this.providerRepository.findById(id);
    if (!provider) throw AppError.notFound('Proveedor no encontrado');
    return provider;
  }

  async listProviders(search: SearchProviderDTO): Promise<Provider[]> {
    // Prioridad a filtros específicos según la interfaz del repositorio
    if (search.specialty) {
      return this.providerRepository.findBySpecialty(search.specialty);
    }

    if (search.city) {
      return this.providerRepository.findByCity(search.city);
    }

    if (search.onlyVerified) {
      return this.providerRepository.findVerified(search.limit, search.offset);
    }

    if (search.minRating) {
      return this.providerRepository.findByRating(search.minRating);
    }

    return this.providerRepository.findAll(search.limit, search.offset);
  }

  async updateProvider(id: string, dto: UpdateProviderDTO): Promise<Provider> {
    const provider = await this.getProviderById(id);

    // Actualización explícita de campos permitidos
    if (dto.businessName) provider.businessName = dto.businessName;
    if (dto.specialty) provider.specialty = dto.specialty;
    if (dto.address) provider.address = dto.address;
    if (dto.city) provider.city = dto.city;
    if (dto.state) provider.state = dto.state;
    if (dto.zipCode) provider.zipCode = dto.zipCode;
    if (dto.phone) provider.phone = dto.phone;
    if (dto.website !== undefined) provider.website = dto.website || null;
    if (dto.description !== undefined) provider.description = dto.description || '';

    provider.updatedAt = new Date();

    const updated = await this.providerRepository.update(id, provider);
    if (!updated) throw AppError.internalServer('Error al actualizar el proveedor');

    return updated;
  }

  async getProviderByUserId(userId: string): Promise<Provider> {
    const provider = await this.providerRepository.findByUserId(userId);
    if (!provider) throw AppError.notFound('Perfil de proveedor no encontrado');
    return provider;
  }
}