/**
 * Clase para respuestas consistentes de la API
 */
export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public message: string,
    public data?: T,
    public statusCode: number = 200,
    public timestamp: Date = new Date()
  ) {}

  /**
   * Crear una respuesta exitosa
   */
  static success<T>(message: string, data?: T, statusCode: number = 200): ApiResponse<T> {
    return new ApiResponse(true, message, data, statusCode);
  }

  /**
   * Crear una respuesta de error
   */
  static error(message: string, statusCode: number = 400): ApiResponse<null> {
    return new ApiResponse(false, message, null, statusCode);
  }

  /**
   * Crear una respuesta de recurso creado
   */
  static created<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(true, message, data, 201);
  }

  /**
   * Crear una respuesta sin contenido
   */
  static noContent(): ApiResponse<null> {
    return new ApiResponse(true, 'No content', null, 204);
  }
}
