import { ProviderService } from '../../src/application/services/ProviderService';
import { IProviderRepository } from '../../src/domain/interfaces/IProviderRepository';
import { Provider } from '../../src/domain/entities/Provider';
import { AppError } from '../../src/shared/utils/AppError';
import { CreateProviderDTO, SearchProviderDTO, UpdateProviderDTO } from '../../src/application/dtos/ProviderDTO';

// Mock de la entidad Provider para los tests
// Asumimos que Provider.create funciona correctamente ya que es lógica de dominio pura
jest.mock('../../src/domain/entities/Provider', () => {
  return {
    Provider: {
      create: jest.fn().mockImplementation((userId, businessName, specialty, address, city, state, zipCode, phone) => ({
        userId, businessName, specialty, address, city, state, zipCode, phone,
        description: '', website: null, updatedAt: new Date()
      }))
    }
  };
});

describe('ProviderService', () => {
  let providerService: ProviderService;
  let mockProviderRepository: jest.Mocked<IProviderRepository>;

  // Datos de prueba
  const mockProviderData = {
    id: 'provider-123',
    userId: 'user-123',
    businessName: 'Test Business',
    specialty: 'General',
    city: 'Test City',
    rating: 4.5,
    isVerified: true
  } as Provider;

  beforeEach(() => {
    // Reiniciamos los mocks antes de cada test
    mockProviderRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findBySpecialty: jest.fn(),
      findByCity: jest.fn(),
      findVerified: jest.fn(),
      findByRating: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    providerService = new ProviderService(mockProviderRepository);
  });

  describe('createProvider', () => {
    const createDto: CreateProviderDTO = {
      userId: 'user-new',
      businessName: 'New Clinic',
      specialty: 'Dentist',
      address: '123 St',
      city: 'Madrid',
      state: 'MD',
      zipCode: '28001',
      phone: '600123456',
      description: 'Best clinic',
      website: 'https://clinic.com'
    };

    it('debería crear un proveedor exitosamente', async () => {
      mockProviderRepository.findByUserId.mockResolvedValue(null);
      mockProviderRepository.save.mockResolvedValue({ ...mockProviderData, ...createDto } as any);

      const result = await providerService.createProvider(createDto);

      expect(mockProviderRepository.findByUserId).toHaveBeenCalledWith(createDto.userId);
      expect(mockProviderRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debería lanzar error si el usuario ya es proveedor', async () => {
      mockProviderRepository.findByUserId.mockResolvedValue(mockProviderData);

      await expect(providerService.createProvider(createDto))
        .rejects
        .toBeInstanceOf(AppError);
    });
  });

  describe('listProviders', () => {
    it('debería filtrar por especialidad', async () => {
      const search: SearchProviderDTO = { specialty: 'Dentist' };
      mockProviderRepository.findBySpecialty.mockResolvedValue([mockProviderData]);

      const result = await providerService.listProviders(search);

      expect(mockProviderRepository.findBySpecialty).toHaveBeenCalledWith('Dentist');
      expect(result).toHaveLength(1);
    });

    it('debería filtrar por ciudad', async () => {
      const search: SearchProviderDTO = { city: 'Madrid' };
      mockProviderRepository.findByCity.mockResolvedValue([mockProviderData]);

      await providerService.listProviders(search);

      expect(mockProviderRepository.findByCity).toHaveBeenCalledWith('Madrid');
    });

    it('debería listar todos si no hay filtros', async () => {
      mockProviderRepository.findAll.mockResolvedValue([mockProviderData, mockProviderData]);

      const result = await providerService.listProviders({ limit: 10, offset: 0 });

      expect(mockProviderRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('updateProvider', () => {
    it('debería actualizar campos permitidos', async () => {
      const updateDto: UpdateProviderDTO = { businessName: 'Updated Name' };
      mockProviderRepository.findById.mockResolvedValue({ ...mockProviderData } as Provider);
      mockProviderRepository.update.mockResolvedValue({ ...mockProviderData, businessName: 'Updated Name' } as Provider);

      const result = await providerService.updateProvider('provider-123', updateDto);

      expect(mockProviderRepository.findById).toHaveBeenCalledWith('provider-123');
      expect(mockProviderRepository.update).toHaveBeenCalled();
      expect(result.businessName).toBe('Updated Name');
    });

    it('debería lanzar error si el proveedor no existe', async () => {
      mockProviderRepository.findById.mockResolvedValue(null);

      await expect(providerService.updateProvider('invalid-id', {}))
        .rejects
        .toThrow('Proveedor no encontrado');
    });
  });
});