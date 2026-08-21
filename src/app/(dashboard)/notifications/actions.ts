'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { PersistentNotificationService } from '@/lib/services/persistent-notification.service';
import { PersistentNotification } from '@/types/database';

/**
 * Obtiene todas las notificaciones del tenant autenticado
 */
export async function getNotificationsAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado', notifications: [], unreadCount: 0 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) {
    return { error: 'No se encontró el negocio.', notifications: [], unreadCount: 0 };
  }

  const tenantId = profile.tenant_id;
  const result = await PersistentNotificationService.getNotifications(supabase, tenantId);
  const unreadCount = await PersistentNotificationService.getUnreadCount(supabase, tenantId);

  return {
    success: true,
    notifications: (result.notifications as PersistentNotification[]) || [],
    unreadCount,
  };
}

/**
 * Obtiene únicamente el contador de notificaciones no leídas
 */
export async function getUnreadNotificationsCountAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { count: 0 };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { count: 0 };

  const count = await PersistentNotificationService.getUnreadCount(supabase, profile.tenant_id);
  return { count };
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsReadAction(notificationId: string) {
  if (!notificationId) {
    return { error: 'ID de notificación no provisto.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: 'No se encontró el negocio.' };

  const result = await PersistentNotificationService.markAsRead(
    supabase,
    profile.tenant_id,
    notificationId
  );

  if (!result.success) {
    return { error: result.error || 'No se pudo marcar la notificación como leída.' };
  }

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Marca todas las notificaciones del tenant como leídas
 */
export async function markAllNotificationsAsReadAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: 'No se encontró el negocio.' };

  const result = await PersistentNotificationService.markAllAsRead(supabase, profile.tenant_id);

  if (!result.success) {
    return { error: result.error || 'No se pudieron marcar las notificaciones.' };
  }

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Elimina una notificación específica
 */
export async function deleteNotificationAction(notificationId: string) {
  if (!notificationId) {
    return { error: 'ID de notificación no provisto.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: 'No se encontró el negocio.' };

  const result = await PersistentNotificationService.delete(
    supabase,
    profile.tenant_id,
    notificationId
  );

  if (!result.success) {
    return { error: result.error || 'No se pudo eliminar la notificación.' };
  }

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Elimina TODAS las notificaciones del tenant
 */
export async function deleteAllNotificationsAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: 'No se encontró el negocio.' };

  const result = await PersistentNotificationService.deleteAll(supabase, profile.tenant_id);

  if (!result.success) {
    return { error: result.error || 'No se pudieron eliminar las notificaciones.' };
  }

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
  return { success: true };
}

