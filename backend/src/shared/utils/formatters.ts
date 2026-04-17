/**
 * Funciones utilitarias para formateo de datos
 */

/**
 * Formatea una fecha a formato legible
 */
export function formatDate(date: Date, locale: string = 'es-ES'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea una fecha y hora
 */
export function formatDateTime(date: Date, locale: string = 'es-ES'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Formatea una hora a HH:mm
 */
export function formatTime(date: Date, locale: string = 'es-ES'): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convierte texto a slug
 */
export function toSlug(text: string): string {
  return text
    .normalize('NFD') // Descompone caracteres acentuados (ej: é -> e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Reemplaza espacios y guiones bajos por guiones
    .replace(/[^a-z0-9-]/g, '') // Elimina caracteres no alfanuméricos
    .replace(/^-+|-+$/g, '');
}

/**
 * Trunca una cadena a una longitud máxima
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Formatea un número como moneda
 */
export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'es-ES'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Formatea un número con decimales
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Obtiene el nombre del día en español
 */
export function getDayName(dayOfWeek: number, locale: string = 'es-ES'): string {
  // Creamos una fecha arbitraria (ej: Domingo 2023-01-01) y sumamos los días
  const date = new Date(Date.UTC(2023, 0, 1 + dayOfWeek));
  return date.toLocaleDateString(locale, { weekday: 'long', timeZone: 'UTC' });
}

/**
 * Obtiene el nombre del mes en español
 */
export function getMonthName(month: number, locale: string = 'es-ES'): string {
  // Asumiendo input 1-12. Date.UTC usa meses 0-11, por eso restamos 1.
  const date = new Date(Date.UTC(2000, month - 1, 1));
  return date.toLocaleDateString(locale, { month: 'long', timeZone: 'UTC' });
}
