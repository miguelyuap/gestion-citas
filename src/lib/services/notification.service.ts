import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

/**
 * Servicio centralizado y reutilizable de notificaciones SweetAlert2
 * Configurado con la paleta de colores limpia y original para una excelente legibilidad.
 */

const baseCustomClass = {
  popup: 'border border-slate-200 bg-white text-slate-900 rounded-2xl shadow-2xl p-6 font-sans',
  title: 'text-xl sm:text-2xl font-bold text-slate-900 tracking-tight',
  htmlContainer: 'text-sm text-slate-600 font-normal leading-relaxed mt-2',
  confirmButton: 'px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-md border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  cancelButton: 'px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
  actions: 'gap-3 mt-6',
};

const gstSwal = Swal.mixin({
  buttonsStyling: false,
  customClass: baseCustomClass,
  background: '#ffffff',
  color: '#0f172a',
  confirmButtonColor: '#2563eb',
  cancelButtonColor: '#e2e8f0',
});

export const NotificationService = {
  /**
   * Muestra una alerta de Éxito
   */
  success: (title: string, text?: string, options?: SweetAlertOptions): Promise<SweetAlertResult> => {
    return gstSwal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Aceptar',
      ...options,
    });
  },

  /**
   * Muestra una alerta de Error
   */
  error: (title: string, text?: string, options?: SweetAlertOptions): Promise<SweetAlertResult> => {
    return gstSwal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options,
    });
  },

  /**
   * Muestra una alerta de Advertencia
   */
  warning: (title: string, text?: string, options?: SweetAlertOptions): Promise<SweetAlertResult> => {
    return gstSwal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options,
    });
  },

  /**
   * Muestra una alerta Informativa
   */
  info: (title: string, text?: string, options?: SweetAlertOptions): Promise<SweetAlertResult> => {
    return gstSwal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options,
    });
  },

  /**
   * Muestra un diálogo de Confirmación (Sí / No)
   */
  confirm: (
    title: string,
    text?: string,
    confirmButtonText: string = 'Confirmar',
    cancelButtonText: string = 'Cancelar'
  ): Promise<SweetAlertResult> => {
    return gstSwal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
    });
  },
};

export default NotificationService;
