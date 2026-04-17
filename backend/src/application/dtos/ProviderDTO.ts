/**
 * DTO para crear un nuevo proveedor
 */
export class CreateProviderDTO {
  userId!: string;
  businessName!: string;
  specialty!: string;
  address!: string;
  city!: string;
  state!: string;
  zipCode!: string;
  phone!: string;
  website?: string;
  description?: string;
}

/**
 * DTO para actualizar un proveedor
 */
export class UpdateProviderDTO {
  businessName?: string;
  specialty?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  description?: string;
}

/**
 * DTO para respuesta de proveedor
 */
export class ProviderResponseDTO {
  id!: string;
  userId!: string;
  businessName!: string;
  specialty!: string;
  description!: string;
  address!: string;
  city!: string;
  state!: string;
  zipCode!: string;
  phone!: string;
  website!: string | null;
  rating!: number;
  totalReviews!: number;
  isVerified!: boolean;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * DTO para búsqueda de proveedores
 */
export class SearchProviderDTO {
  specialty?: string;
  city?: string;
  minRating?: number;
  limit?: number;
  offset?: number;
  onlyVerified?: boolean;
}
