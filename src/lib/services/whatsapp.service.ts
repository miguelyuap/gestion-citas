/**
 * Servicio de Notificaciones e Integración con WhatsApp
 * Genera mensajes formateados y URLs sanitizadas (con código de país) para clientes y administradores.
 */

export interface WhatsAppBookingDetails {
  businessName: string;
  serviceName: string;
  staffName?: string;
  branchName?: string;
  branchAddress?: string;
  dateFormatted: string;
  timeFormatted: string;
  totalPrice?: number | string;
  clientName: string;
  clientPhone: string;
}

export const WhatsAppService = {
  /**
   * Sanitiza el número de teléfono eliminando caracteres no numéricos
   * Si es un número colombiano de 10 dígitos que inicia con 3 (ej: 3147656967), antepone el código de país (57)
   */
  cleanPhone(phone: string): string {
    let cleaned = phone.replace(/[^0-9]/g, '');

    // Autocorrección para números móviles colombianos de 10 dígitos
    if (cleaned.length === 10 && cleaned.startsWith('3')) {
      cleaned = '57' + cleaned;
    }

    return cleaned;
  },

  /**
   * Genera el mensaje de confirmación de agendamiento de cita
   */
  generateBookingMessage(details: WhatsAppBookingDetails): string {
    const branchInfo = details.branchName ? `\n📍 *Sucursal:* ${details.branchName}` : '';
    const staffInfo = details.staffName ? `\n👤 *Atendido por:* ${details.staffName}` : '';
    const priceInfo = details.totalPrice ? `\n💰 *Valor:* $${details.totalPrice}` : '';

    return (
      `Hola *${details.clientName}*, ¡tu cita en *${details.businessName}* ha sido agendada con éxito! 🎉\n\n` +
      `📌 *Servicio:* ${details.serviceName}` +
      `${branchInfo}` +
      `${staffInfo}\n` +
      `📅 *Fecha:* ${details.dateFormatted}\n` +
      `⏰ *Hora:* ${details.timeFormatted}` +
      `${priceInfo}\n\n` +
      `Te esperamos a tiempo. Puedes gestionar tus citas desde nuestro portal.`
    );
  },

  /**
   * Genera el mensaje de reagendamiento de cita
   */
  generateRescheduleMessage(details: WhatsAppBookingDetails): string {
    const branchInfo = details.branchName ? `\n📍 *Sucursal:* ${details.branchName}` : '';
    const staffInfo = details.staffName ? `\n👤 *Atendido por:* ${details.staffName}` : '';

    return (
      `Hola *${details.clientName}*, tu cita en *${details.businessName}* ha sido *reagendada* exitosamente. 🗓️\n\n` +
      `📌 *Servicio:* ${details.serviceName}` +
      `${branchInfo}` +
      `${staffInfo}\n` +
      `📅 *NUEVA Fecha:* ${details.dateFormatted}\n` +
      `⏰ *NUEVA Hora:* ${details.timeFormatted}\n\n` +
      `¡Gracias por tu preferencia!`
    );
  },

  /**
   * Genera el mensaje de cancelación de cita
   */
  generateCancellationMessage(details: WhatsAppBookingDetails, reason?: string): string {
    const reasonText = reason ? `\nMotivo: _${reason}_` : '';

    return (
      `Hola *${details.clientName}*, confirmamos que tu cita para *${details.serviceName}* en *${details.businessName}* el ${details.dateFormatted} a las ${details.timeFormatted} ha sido *cancelada*. ❌` +
      `${reasonText}\n\n` +
      `Puedes volver a agendar en cualquier momento desde nuestro portal online.`
    );
  },

  /**
   * Genera la URL oficial de la API de WhatsApp
   */
  buildWhatsAppUrl(phone: string, message: string): string {
    const cleanNumber = this.cleanPhone(phone);
    const encodedMsg = encodeURIComponent(message);
    return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMsg}`;
  },

  /**
   * Dispara / Despacha el mensaje de WhatsApp al número destino de forma segura
   */
  sendWhatsAppNotification(phone: string, message: string) {
    if (!phone) return;
    const url = this.buildWhatsAppUrl(phone, message);
    try {
      window.open(url, '_blank');
    } catch (e) {
      console.error('Error abriendo WhatsApp:', e);
    }
  },
};

export default WhatsAppService;
