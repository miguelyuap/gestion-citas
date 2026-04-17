import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { User } from '@domain/entities/User';
import { UserEntity } from '../entities/UserEntity';
import { UserMapper } from '../mappers/UserMapper';

export class UserRepository implements IUserRepository {
  private ormRepository: Repository<UserEntity>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(UserEntity);
  }

  async save(user: User): Promise<User> {
    const userEntity = UserMapper.toPersistence(user);
    const savedEntity = await this.ormRepository.save(userEntity);
    return UserMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.ormRepository.findOne({
      where: { id },
      relations: ['appointmentsAsClient', 'appointmentsAsProvider', 'timeSlots'],
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.ormRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    const query = this.ormRepository.createQueryBuilder('user');

    if (offset) {
      query.skip(offset);
    }

    if (limit) {
      query.take(limit);
    }

    const entities = await query.orderBy('user.createdAt', 'DESC').getMany();
    return entities.map((entity) => UserMapper.toDomain(entity));
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const userEntity = await this.ormRepository.findOne({ where: { id } });

    if (!userEntity) {
      return null;
    }

    const updates = UserMapper.toPersistence(user as User);
    Object.assign(userEntity, updates);

    const updatedEntity = await this.ormRepository.save(userEntity);
    return UserMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ormRepository.softDelete({ id });
    return (result.affected || 0) > 0;
  }

  async count(): Promise<number> {
    return this.ormRepository.count({ where: { active: true } });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  // Métodos adicionales útiles para la autenticación
  async findByPhone(phone: string): Promise<User | null> {
    const user = await this.ormRepository.findOne({
      where: { phone },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await this.ormRepository.update(
      { id },
      { password: hashedPassword }
    );
    return (result.affected || 0) > 0;
  }

  async updateLastLogin(id: string): Promise<boolean> {
    const result = await this.ormRepository.update(
      { id },
      { lastLoginAt: new Date() }
    );
    return (result.affected || 0) > 0;
  }

  async updateRefreshToken(
    id: string,
    token: string,
    expiresAt: Date
  ): Promise<boolean> {
    const result = await this.ormRepository.update(
      { id },
      { refreshToken: token, refreshTokenExpiry: expiresAt }
    );
    return (result.affected || 0) > 0;
  }

  async clearRefreshToken(id: string): Promise<boolean> {
    const result = await this.ormRepository.update(
      { id },
      { refreshToken: undefined, refreshTokenExpiry: undefined }
    );
    return (result.affected || 0) > 0;
  }

  async findByRefreshToken(token: string): Promise<User | null> {
    const user = await this.ormRepository.findOne({
      where: { refreshToken: token },
    });

    if (
      !user ||
      !user.refreshTokenExpiry ||
      new Date() > user.refreshTokenExpiry
    ) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async verifyEmail(id: string): Promise<boolean> {
    const result = await this.ormRepository.update(
      { id },
      { emailVerified: true, emailVerifiedAt: new Date() }
    );
    return (result.affected || 0) > 0;
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.ormRepository.update({ id }, { active: false });
    return (result.affected || 0) > 0;
  }

  async activate(id: string): Promise<boolean> {
    const result = await this.ormRepository.update({ id }, { active: true });
    return (result.affected || 0) > 0;
  }
}
