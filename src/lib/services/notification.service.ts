import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

/**
 * Servicio centralizado y reutilizable de notificaciones SweetAlert2
 * Adaptado con la identidad visual y paleta oscura de GST Software.
 */

const baseCustomClass = {
  popup: 'border border-slate-800 bg-slate-900/95 text-slate-100 backdrop-blur-xl rounded-3xl shadow-2xl p-6 font-sans',
  title: 'text-xl sm:text-2xl font-extrabold text-white tracking-tight',
  htmlContainer: 'text-sm text-slate-300 font-normal leading-relaxed mt-2',
  confirmButton: 'px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition shadow-lg shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 border-0',
  cancelButton: 'px-5 py-2.5 rounded-xl font-bold text-sm text-slate-300 bg-slate-800/80 hover:bg-slate-700 transition border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-900',
  actions: 'gap-3 mt-6',
};

const gstSwal = Swal.mixin({
  buttonsStyling: false,
  customClass: baseCustomClass,
  background: 'rgba(15, 23, 42, 0.95)',
  color: '#f8fafc',
  confirmButtonColor: '#4f46e5',
  cancelButtonColor: '#334155',
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
      iconColor: '#10b981', // Emerald
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
      iconColor: '#f43f5e', // Rose / Red
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
      iconColor: '#f59e0b', // Amber
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
      iconColor: '#6366f1', // Indigo
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
      iconColor: '#8b5cf6', // Purple
    });
  },
};

export default NotificationService;
