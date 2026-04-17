import { Repository, Like } from 'typeorm';
import { AppDataSource } from '@config/database';
import { IProviderRepository } from '@domain/interfaces/IProviderRepository';
import { Provider } from '@domain/entities/Provider';
import { ProviderEntity } from '../entities/ProviderEntity';
import { ProviderMapper } from '@application/mappers/ProviderMapper';

export class ProviderRepository implements IProviderRepository {
  private ormRepository: Repository<ProviderEntity>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(ProviderEntity);
  }

  async findById(id: string): Promise<Provider | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
      relations: ['user']
    });
    return entity ? ProviderMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Provider | null> {
    const entity = await this.ormRepository.findOne({
      where: { userId },
      relations: ['user']
    });
    return entity ? ProviderMapper.toDomain(entity) : null;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<Provider[]> {
    const entities = await this.ormRepository.find({
      take: limit,
      skip: offset,
      relations: ['user'],
      order: { rating: 'DESC' }
    });
    return entities.map(ProviderMapper.toDomain);
  }

  async findBySpecialty(specialty: string): Promise<Provider[]> {
    const entities = await this.ormRepository.find({
      where: { specialty: Like(`%${specialty}%`) },
      relations: ['user']
    });
    return entities.map(ProviderMapper.toDomain);
  }

  async findByCity(city: string): Promise<Provider[]> {
    // Esta consulta es más compleja porque city está en User, no en Provider
    const entities = await this.ormRepository.createQueryBuilder('provider')
      .leftJoinAndSelect('provider.user', 'user')
      .where('user.city ILIKE :city', { city: `%${city}%` })
      .getMany();
    return entities.map(ProviderMapper.toDomain);
  }

  async findVerified(limit?: number, offset?: number): Promise<Provider[]> {
    const entities = await this.ormRepository.find({
      where: { isVerified: true },
      take: limit,
      skip: offset,
      relations: ['user']
    });
    return entities.map(ProviderMapper.toDomain);
  }

  async save(provider: Provider): Promise<Provider> {
    const persistence = ProviderMapper.toPersistence(provider);
    const saved = await this.ormRepository.save(persistence);
    // Recargamos para obtener la relación user
    return (await this.findById(saved.id))!;
  }

  async update(id: string, provider: Partial<Provider>): Promise<Provider | null> {
    await this.ormRepository.update(id, ProviderMapper.toPersistence(provider as Provider));
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  async count(): Promise<number> { return this.ormRepository.count(); }
  async findByRating(minRating: number): Promise<Provider[]> { return []; } // Implementación simplificada
}