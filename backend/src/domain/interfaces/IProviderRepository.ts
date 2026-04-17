import { Provider } from '../entities/Provider';

/**
 * Interfaz para el repositorio de Proveedores
 * Define el contrato que todo repositorio de Provider debe cumplir
 */
export interface IProviderRepository {
  /**
   * Encontrar proveedor por ID
   */
  findById(id: string): Promise<Provider | null>;

  /**
   * Encontrar proveedor por ID de usuario
   */
  findByUserId(userId: string): Promise<Provider | null>;

  /**
   * Obtener todos los proveedores
   */
  findAll(limit?: number, offset?: number): Promise<Provider[]>;

  /**
   * Buscar proveedores por especialidad
   */
  findBySpecialty(specialty: string): Promise<Provider[]>;

  /**
   * Buscar proveedores por ciudad
   */
  findByCity(city: string): Promise<Provider[]>;

  /**
   * Obtener proveedores verificados
   */
  findVerified(limit?: number, offset?: number): Promise<Provider[]>;

  /**
   * Guardar un nuevo proveedor
   */
  save(provider: Provider): Promise<Provider>;

  /**
   * Actualizar un proveedor existente
   */
  update(id: string, provider: Partial<Provider>): Promise<Provider | null>;

  /**
   * Eliminar un proveedor
   */
  delete(id: string): Promise<boolean>;

  /**
   * Contar proveedores totales
   */
  count(): Promise<number>;

  /**
   * Obtener proveedores por rating
   */
  findByRating(minRating: number): Promise<Provider[]>;
}
