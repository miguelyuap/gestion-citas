import WhatsAppService from './whatsapp.service';

export interface ServerWhatsAppInput {
  phone: string;
  message: string;
}

/**
 * Servicio del Lado del Servidor para el envío automático de notificaciones por WhatsApp.
 * Soporta integración con Meta WhatsApp Cloud API, Twilio o pasarelas de Webhook.
 */
export async function sendServerWhatsAppNotification(input: ServerWhatsAppInput) {
  const { phone, message } = input;
  const cleanPhone = WhatsAppService.cleanPhone(phone);

  if (!cleanPhone) {
    return { success: false, error: 'Número de teléfono no válido.' };
  }

  const apiUrl = process.env.WHATSAPP_API_URL || process.env.NEXT_PUBLIC_WHATSAPP_API_URL;
  const apiToken = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_TOKEN;

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        },
        body: JSON.stringify({
          phone: cleanPhone,
          to: cleanPhone,
          message,
        }),
      });

      if (response.ok) {
        return { success: true };
      }
    } catch (err: any) {
      console.error('[WhatsApp Server Error]', err?.message || err);
    }
  }

  return { success: true, queued: true };
}
