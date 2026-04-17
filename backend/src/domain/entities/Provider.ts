/**
 * Entidad de Dominio: Proveedor
 * Representa un proveedor de servicios en el sistema
 */
export class Provider {
  public id!: string;
  public userId!: string;
  public businessName!: string;
  public specialty!: string;
  public description!: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public phone!: string;
  public website!: string | null;
  public rating!: number;
  public totalReviews!: number;
  public isVerified!: boolean;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  /**
   * Constructor privado para forzar uso de método factory
   */
  private constructor() {}

  /**
   * Método factory para crear una nueva instancia de Proveedor
   */
  public static create(
    userId: string,
    businessName: string,
    specialty: string,
    address: string,
    city: string,
    state: string,
    zipCode: string,
    phone: string
  ): Provider {
    const provider = new Provider();
    provider.userId = userId;
    provider.businessName = businessName;
    provider.specialty = specialty;
    provider.description = '';
    provider.address = address;
    provider.city = city;
    provider.state = state;
    provider.zipCode = zipCode;
    provider.phone = phone;
    provider.website = null;
    provider.rating = 0;
    provider.totalReviews = 0;
    provider.isVerified = false;
    provider.isActive = true;
    provider.createdAt = new Date();
    provider.updatedAt = new Date();
    return provider;
  }

  /**
   * Valida que el proveedor tenga todos los campos requeridos
   */
  public isValid(): boolean {
    return (
      this.userId.length > 0 &&
      this.businessName.length > 0 &&
      this.specialty.length > 0 &&
      this.address.length > 0 &&
      this.city.length > 0
    );
  }

  /**
   * Calcula el promedio de calificación
   */
  public updateRating(newRating: number): void {
    if (newRating >= 0 && newRating <= 5) {
      const totalScore = this.rating * this.totalReviews + newRating;
      this.totalReviews += 1;
      this.rating = parseFloat((totalScore / this.totalReviews).toFixed(1));
      this.updatedAt = new Date();
    }
  }

  /**
   * Verifica si el proveedor está habilitado para recibir citas
   */
  public canReceiveAppointments(): boolean {
    return this.isActive && this.isVerified;
  }

  /**
   * Obtiene la ubicación completa del proveedor
   */
  public getFullLocation(): string {
    return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}`;
  }
}
