import { SupabaseClient } from '@supabase/supabase-js';
import { NotificationType, PersistentNotification } from '@/types/database';

export interface CreateNotificationInput {
  tenantId: string;
  clientId?: string | null;
  appointmentId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  // Canales futuros opcionales para extensión (Fases posteriores: email, whatsapp, sms, push)
  channels?: Array<'system' | 'email' | 'whatsapp' | 'sms' | 'push'>;
}

/**
 * Servicio de Notificaciones Persistentes (Almacenamiento en Supabase)
 * Diseñado con arquitectura limpia y soporte multi-tenant.
 * Preparado para extender con proveedores externos (WhatsApp, Email, SMS) en fases futuras.
 */
export class PersistentNotificationService {
  /**
   * Crea una notificación persistente en la base de datos Supabase
   */
  static async create(supabase: SupabaseClient, input: CreateNotificationInput) {
    const { tenantId, clientId, appointmentId, type, title, message, metadata, channels = ['system'] } = input;

    // 1. Guardar la notificación persistente en Supabase (Sistema)
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        tenant_id: tenantId,
        client_id: clientId || null,
        appointment_id: appointmentId || null,
        type,
        title,
        message,
        is_read: false,
        metadata: metadata || {},
      })
      .select('*')
      .single();

    if (error) {
      console.error('[PersistentNotificationService] Error guardando notificación:', error);
      return { success: false, error: error.message };
    }

    // 2. Hook de preparación para canales externos (Futuro: Email, WhatsApp, SMS, Push)
    // En fases posteriores se invocará a proveedores como Twilio, Resend, FCM, etc.
    if (channels.length > 1) {
      this.dispatchExternalChannels(channels.filter(c => c !== 'system'), data);
    }

    return { success: true, notification: data as PersistentNotification };
  }

  /**
   * Obtiene las notificaciones del tenant autenticado con orden cronológico descendente
   */
  static async getNotifications(supabase: SupabaseClient, tenantId: string, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        client:clients(id, name, email, phone)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[PersistentNotificationService] Error consultando notificaciones:', error);
      return { success: false, notifications: [] as PersistentNotification[], error: error.message };
    }

    return { success: true, notifications: (data as PersistentNotification[]) || [] };
  }

  /**
   * Obtiene el número total de notificaciones no leídas de un tenant
   */
  static async getUnreadCount(supabase: SupabaseClient, tenantId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_read', false);

    if (error) {
      console.error('[PersistentNotificationService] Error contando no leídas:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Marca una notificación específica como leída
   */
  static async markAsRead(supabase: SupabaseClient, tenantId: string, notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) {
      console.error('[PersistentNotificationService] Error marcando como leída:', error);
      return { success: false, error: error.message };
    }

    return { success: true, notification: data as PersistentNotification };
  }

  /**
   * Marca TODAS las notificaciones del tenant como leídas
   */
  static async markAllAsRead(supabase: SupabaseClient, tenantId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('tenant_id', tenantId)
      .eq('is_read', false);

    if (error) {
      console.error('[PersistentNotificationService] Error marcando todas como leídas:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Elimina una notificación específica
   */
  static async delete(supabase: SupabaseClient, tenantId: string, notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[PersistentNotificationService] Error eliminando notificación:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Elimina TODAS las notificaciones del tenant
   */
  static async deleteAll(supabase: SupabaseClient, tenantId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[PersistentNotificationService] Error eliminando todas las notificaciones:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * STUB / HOOK para integraciones externas futuras (Email, WhatsApp, SMS, Push)
   * NO ejecuta nada en esta fase, pero estructura el flujo de despacho.
   */
  private static async dispatchExternalChannels(channels: string[], notification: any) {
    // Ejemplo de extensiones futuras:
    // if (channels.includes('email')) await EmailProvider.send(notification);
    // if (channels.includes('whatsapp')) await WhatsAppProvider.send(notification);
    console.log(`[PersistentNotificationService] Canales adicionales listos para futuras fases:`, channels);
  }
}

