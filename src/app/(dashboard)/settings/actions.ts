'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getTenantIdForUser } from '@/lib/services/tenant-context.service';

export interface TenantConfigInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  primaryColor?: string;
  defaultSlotDuration?: number;
  minBookingNoticeHours?: number;
  cancellationHoursNotice?: number;
  startWorkTime?: string;
  endWorkTime?: string;
  notificationToggles?: Record<string, boolean>;
}

/**
 * Obtiene la configuración completa del tenant del usuario autenticado
 */
export async function getTenantConfigAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const tenantId = await getTenantIdForUser(supabase, user);
  if (!tenantId) {
    throw new Error('Negocio no encontrado para el usuario activo');
  }

  const adminDb = await createAdminClient();

  const [
    { data: tenant },
    { data: theme },
    { data: settings },
  ] = await Promise.all([
    adminDb.from('tenants').select('*').eq('id', tenantId).maybeSingle(),
    adminDb.from('tenant_theme').select('*').eq('tenant_id', tenantId).maybeSingle(),
    adminDb.from('tenant_settings').select('*').eq('tenant_id', tenantId).maybeSingle(),
  ]);

  const togglesData = (settings?.notification_toggles as Record<string, any>) || {};
  const mergedTenant = {
    ...(tenant || {}),
    address: tenant?.address || settings?.address || togglesData._address || '',
    city: tenant?.city || settings?.city || togglesData._city || '',
  };

  return {
    tenant: mergedTenant,
    theme: theme || { primary_color: '#4f46e5' },
    settings: settings || {
      cancellation_hours_notice: 24,
      min_booking_notice_hours: 2,
      default_slot_duration: 45,
      start_work_time: '08:00',
      end_work_time: '18:00',
      notification_toggles: {
        email: true,
        whatsapp: false,
        recordatorio24h: true,
        recordatorio1h: true,
        confirmacion: true,
        cancelacion: true,
      },
    },
  };
}

/**
 * Guarda los cambios de configuración del negocio (Empresa, Agenda, Notificaciones)
 */
export async function saveTenantConfigAction(input: TenantConfigInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  try {
    const tenantId = await getTenantIdForUser(supabase, user);
    if (!tenantId) {
      return { success: false, error: 'Negocio no encontrado' };
    }

    const adminDb = await createAdminClient();

    // Anclar de forma permanente el usuario a su tenant_id en la tabla profiles
    await adminDb.from('profiles').upsert(
      {
        id: user.id,
        tenant_id: tenantId,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador',
        role: 'owner',
      },
      { onConflict: 'id' }
    );

    // 1. Actualizar datos de TENANTS
    const tenantUpdate: Record<string, any> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) tenantUpdate.name = input.name.trim();
    if (input.phone !== undefined) tenantUpdate.phone = input.phone ? input.phone.trim() : null;
    if (input.email !== undefined) tenantUpdate.email = input.email ? input.email.trim() : null;
    if (input.address !== undefined) tenantUpdate.address = input.address ? input.address.trim() : null;
    if (input.city !== undefined) tenantUpdate.city = input.city ? input.city.trim() : null;

    if (Object.keys(tenantUpdate).length > 1) {
      let { error: tenantErr } = await adminDb
        .from('tenants')
        .update(tenantUpdate)
        .eq('id', tenantId);

      // Fallback si la columna 'address' o 'city' no existe aún en la tabla 'tenants' de Supabase
      if (tenantErr && (tenantErr.message?.includes("'address'") || tenantErr.message?.includes("'city'"))) {
        const fallbackUpdate = { ...tenantUpdate };
        delete fallbackUpdate.address;
        delete fallbackUpdate.city;

        await adminDb
          .from('tenants')
          .update(fallbackUpdate)
          .eq('id', tenantId);
      }
    }

    // 2. Actualizar TENANT_THEME
    if (input.primaryColor) {
      await adminDb
        .from('tenant_theme')
        .upsert(
          {
            tenant_id: tenantId,
            primary_color: input.primaryColor.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'tenant_id' }
        );
    }

    // 3. Actualizar TENANT_SETTINGS (Agenda, Notificaciones, y respaldo JSONB de Dirección/Ciudad)
    const { data: existingSettings } = await adminDb
      .from('tenant_settings')
      .select('tenant_id, notification_toggles')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    const currentToggles = (existingSettings?.notification_toggles as Record<string, any>) || {};
    const updatedToggles = {
      ...(input.notificationToggles || currentToggles),
      _address: input.address !== undefined ? (input.address ? input.address.trim() : null) : currentToggles._address,
      _city: input.city !== undefined ? (input.city ? input.city.trim() : null) : currentToggles._city,
    };

    const settingsPayload: Record<string, any> = {
      tenant_id: tenantId,
      notification_toggles: updatedToggles,
      updated_at: new Date().toISOString(),
    };

    if (input.address !== undefined) settingsPayload.address = input.address ? input.address.trim() : null;
    if (input.city !== undefined) settingsPayload.city = input.city ? input.city.trim() : null;
    if (input.defaultSlotDuration !== undefined) settingsPayload.default_slot_duration = input.defaultSlotDuration;
    if (input.minBookingNoticeHours !== undefined) settingsPayload.min_booking_notice_hours = input.minBookingNoticeHours;
    if (input.cancellationHoursNotice !== undefined) settingsPayload.cancellation_hours_notice = input.cancellationHoursNotice;
    if (input.startWorkTime !== undefined) settingsPayload.start_work_time = input.startWorkTime;
    if (input.endWorkTime !== undefined) settingsPayload.end_work_time = input.endWorkTime;

    let { error: setErr } = await adminDb
      .from('tenant_settings')
      .upsert(settingsPayload, { onConflict: 'tenant_id' });

    if (setErr && (setErr.message?.includes("'address'") || setErr.message?.includes("'city'"))) {
      const fallbackSettings = { ...settingsPayload };
      delete fallbackSettings.address;
      delete fallbackSettings.city;
      await adminDb
        .from('tenant_settings')
        .upsert(fallbackSettings, { onConflict: 'tenant_id' });
    }

    // 4. Revalidar cachés de Next.js
    revalidatePath('/dashboard');
    revalidatePath('/settings');
    revalidatePath('/dashboard/appearance');

    const { data: currentTenant } = await adminDb
      .from('tenants')
      .select('slug')
      .eq('id', tenantId)
      .maybeSingle();

    if (currentTenant?.slug) {
      revalidatePath(`/${currentTenant.slug}`);
      revalidatePath(`/${currentTenant.slug}/book`);
      revalidatePath('/[slug]', 'page');
      revalidatePath('/[slug]/book', 'page');
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error en saveTenantConfigAction:', err);
    return { success: false, error: err.message || 'Error guardando la configuración.' };
  }
}

/**
 * Sube un archivo de logo para la empresa
 */
export async function uploadTenantLogoAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  try {
    const tenantId = await getTenantIdForUser(supabase, user);
    if (!tenantId) {
      return { success: false, error: 'Negocio no encontrado' };
    }

    const adminDb = await createAdminClient();
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No se envió ningún archivo' };
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-logo.${fileExt}`;
    const filePath = `${tenantId}/branding/${fileName}`;

    const { error: uploadError } = await adminDb.storage
      .from('tenant-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return { success: false, error: `Error de subida: ${uploadError.message}` };
    }

    const { data: publicUrlData } = adminDb.storage
      .from('tenant-assets')
      .getPublicUrl(filePath);

    const logoUrl = publicUrlData.publicUrl;

    // Actualizar logo_url en TENANTS
    await adminDb
      .from('tenants')
      .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
      .eq('id', tenantId);

    revalidatePath('/dashboard');
    revalidatePath('/settings');

    return { success: true, logoUrl };
  } catch (err: any) {
    console.error('Error al subir logo:', err);
    return { success: false, error: err.message || 'Error al subir la imagen' };
  }
}
