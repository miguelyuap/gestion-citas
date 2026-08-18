'use server';

import { createClient } from '@/lib/supabase/server';
import {
  CompleteTenantAppearance,
  TenantSettings,
  TenantTheme,
  TenantSectionConfig,
  TenantSocials,
  TenantGalleryItem,
  TenantTestimonialItem,
} from '@/types/theme';
import { DEFAULT_COMPLETE_APPEARANCE } from '@/lib/theme/presets';
import { revalidatePath } from 'next/cache';

/**
 * Helper interno para obtener o auto-crear el tenant_id del usuario autenticado
 */
async function getOrCreateTenantForUser(supabase: any, user: any) {
  // 1. Consultar perfil del usuario usando maybeSingle()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, tenants(*)')
    .eq('id', user.id)
    .maybeSingle();

  if (profile && profile.tenant_id) {
    const tenantRaw = profile.tenants;
    const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
    return { tenantId: profile.tenant_id, tenant };
  }

  // 2. Si no tiene perfil vinculado, buscar si ya existe un tenant para el email del usuario
  let { data: existingTenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  if (!existingTenant) {
    const businessName = user.user_metadata?.business_name || 'Mi Negocio';
    let baseSlug = user.user_metadata?.slug || `negocio-${user.id.substring(0, 8)}`;
    baseSlug = baseSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const { data: newTenant, error: createTenantErr } = await supabase
      .from('tenants')
      .insert({
        name: businessName,
        slug: baseSlug,
        email: user.email,
        is_active: true,
      })
      .select()
      .single();

    if (createTenantErr) {
      console.error('Error auto-creando tenant:', createTenantErr);
      throw new Error(`No se pudo inicializar el negocio: ${createTenantErr.message}`);
    }
    existingTenant = newTenant;
  }

  // 3. Crear o actualizar el perfil vinculado al usuario y al tenant
  await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      tenant_id: existingTenant.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador',
      role: 'owner',
    });

  // 4. Asegurar registros iniciales de apariencia
  await Promise.all([
    supabase.from('tenant_settings').upsert({ tenant_id: existingTenant.id }),
    supabase.from('tenant_theme').upsert({ tenant_id: existingTenant.id }),
    supabase.from('tenant_socials').upsert({ tenant_id: existingTenant.id }),
    supabase.from('tenant_sections').upsert([
      { tenant_id: existingTenant.id, section_key: 'hero', is_enabled: true, display_order: 1 },
      { tenant_id: existingTenant.id, section_key: 'services', is_enabled: true, display_order: 2 },
      { tenant_id: existingTenant.id, section_key: 'staff', is_enabled: true, display_order: 3 },
      { tenant_id: existingTenant.id, section_key: 'about', is_enabled: true, display_order: 4 },
      { tenant_id: existingTenant.id, section_key: 'gallery', is_enabled: true, display_order: 5 },
      { tenant_id: existingTenant.id, section_key: 'testimonials', is_enabled: true, display_order: 6 },
      { tenant_id: existingTenant.id, section_key: 'booking_cta', is_enabled: true, display_order: 7 },
      { tenant_id: existingTenant.id, section_key: 'contact', is_enabled: true, display_order: 8 },
    ], { onConflict: 'tenant_id,section_key' }),
  ]);

  return { tenantId: existingTenant.id, tenant: existingTenant };
}

/**
 * Obtiene la configuración completa de apariencia del tenant del usuario autenticado
 */
export async function getTenantAppearanceAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado. Por favor inicia sesión.');
  }

  // Obtener o auto-crear tenant del usuario
  const { tenantId, tenant } = await getOrCreateTenantForUser(supabase, user);

  // Consultar tablas de apariencia de forma segura
  const [
    { data: settings },
    { data: theme },
    { data: sections },
    { data: socials },
    { data: gallery },
    { data: testimonials },
    { data: services },
    { data: staff },
    { data: workingHours },
  ] = await Promise.all([
    supabase.from('tenant_settings').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('tenant_theme').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('tenant_sections').select('*').eq('tenant_id', tenantId).order('display_order', { ascending: true }),
    supabase.from('tenant_socials').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('tenant_gallery').select('*').eq('tenant_id', tenantId).order('display_order', { ascending: true }),
    supabase.from('tenant_testimonials').select('*').eq('tenant_id', tenantId).order('display_order', { ascending: true }),
    supabase.from('services').select('*').eq('tenant_id', tenantId).eq('is_active', true),
    supabase.from('staff').select('*').eq('tenant_id', tenantId).eq('is_active', true),
    supabase.from('working_hours').select('*').eq('tenant_id', tenantId),
  ]);

  // Si no existen datos guardados aún, estructurar defaults
  const mergedAppearance: CompleteTenantAppearance = {
    settings: {
      ...DEFAULT_COMPLETE_APPEARANCE.settings,
      ...(settings || {}),
    },
    theme: {
      ...DEFAULT_COMPLETE_APPEARANCE.theme,
      ...(theme || {}),
    },
    sections: sections && sections.length > 0 ? sections : DEFAULT_COMPLETE_APPEARANCE.sections,
    socials: {
      ...DEFAULT_COMPLETE_APPEARANCE.socials,
      ...(socials || {}),
    },
    gallery: gallery || [],
    testimonials: testimonials || [],
  };

  return {
    tenant,
    appearance: mergedAppearance,
    services: services || [],
    staff: staff || [],
    workingHours: workingHours || [],
  };
}

/**
 * Guarda los cambios completos de apariencia (settings, theme, sections, socials, gallery, testimonials)
 */
export async function saveTenantAppearanceAction(appearanceData: CompleteTenantAppearance) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  try {
    const { tenantId, tenant } = await getOrCreateTenantForUser(supabase, user);

    // 1. Guardar tenant_settings
    const { error: settingsErr } = await supabase
      .from('tenant_settings')
      .upsert({
        tenant_id: tenantId,
        template: appearanceData.settings.template,
        hero_title: appearanceData.settings.hero_title,
        hero_subtitle: appearanceData.settings.hero_subtitle,
        hero_image_url: appearanceData.settings.hero_image_url || null,
        hero_badge: appearanceData.settings.hero_badge || null,
        hero_cta_text: appearanceData.settings.hero_cta_text,
        hero_secondary_cta_text: appearanceData.settings.hero_secondary_cta_text || null,
        about_title: appearanceData.settings.about_title || 'Sobre Nosotros',
        about_text: appearanceData.settings.about_text || null,
        about_image_url: appearanceData.settings.about_image_url || null,
        whatsapp_number: appearanceData.settings.whatsapp_number || null,
        updated_at: new Date().toISOString(),
      });

    if (settingsErr) throw settingsErr;

    // 2. Guardar tenant_theme
    const { error: themeErr } = await supabase
      .from('tenant_theme')
      .upsert({
        tenant_id: tenantId,
        primary_color: appearanceData.theme.primary_color,
        secondary_color: appearanceData.theme.secondary_color,
        background_color: appearanceData.theme.background_color,
        surface_color: appearanceData.theme.surface_color,
        text_color: appearanceData.theme.text_color,
        muted_text_color: appearanceData.theme.muted_text_color,
        accent_color: appearanceData.theme.accent_color,
        font_family: appearanceData.theme.font_family,
        border_radius: appearanceData.theme.border_radius,
        button_style: appearanceData.theme.button_style,
        updated_at: new Date().toISOString(),
      });

    if (themeErr) throw themeErr;

    // 3. Guardar tenant_sections
    if (appearanceData.sections && appearanceData.sections.length > 0) {
      const sectionPayload = appearanceData.sections.map((sec) => ({
        tenant_id: tenantId,
        section_key: sec.section_key,
        is_enabled: sec.is_enabled,
        display_order: sec.display_order,
      }));

      const { error: sectionsErr } = await supabase
        .from('tenant_sections')
        .upsert(sectionPayload, { onConflict: 'tenant_id,section_key' });

      if (sectionsErr) throw sectionsErr;
    }

    // 4. Guardar tenant_socials
    if (appearanceData.socials) {
      const { error: socialsErr } = await supabase
        .from('tenant_socials')
        .upsert({
          tenant_id: tenantId,
          instagram: appearanceData.socials.instagram || null,
          facebook: appearanceData.socials.facebook || null,
          tiktok: appearanceData.socials.tiktok || null,
          whatsapp: appearanceData.socials.whatsapp || null,
          updated_at: new Date().toISOString(),
        });

      if (socialsErr) throw socialsErr;
    }

    // Revalidar cachés
    revalidatePath('/dashboard/appearance');
    if (tenant?.slug) {
      revalidatePath(`/${tenant.slug}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error guardando apariencia:', err);
    return { success: false, error: err.message || 'Error guardando en Supabase' };
  }
}

/**
 * Sube un archivo (logo, gallery, avatar) a Supabase Storage en tenant-assets/{tenant_id}/{folder}/{filename}
 */
export async function uploadTenantAssetAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  try {
    const { tenantId } = await getOrCreateTenantForUser(supabase, user);
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return { success: false, error: 'No se envió ningún archivo' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `${tenantId}/${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('tenant-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error en upload storage:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Obtener URL pública del archivo
    const { data: publicUrlData } = supabase.storage
      .from('tenant-assets')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Si la subida fue para el logo, actualizar la tabla tenants
    if (folder === 'logo') {
      await supabase.from('tenants').update({ logo_url: publicUrl }).eq('id', tenantId);
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/appearance');
    }

    return { success: true, publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Agrega un elemento a la galería de fotos en `tenant_gallery`
 */
export async function addGalleryItemAction(imageUrl: string, caption?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autenticado' };

  try {
    const { tenantId } = await getOrCreateTenantForUser(supabase, user);

    const { data: existing } = await supabase.from('tenant_gallery').select('display_order').eq('tenant_id', tenantId);
    const nextOrder = (existing?.length || 0) + 1;

    const { data, error } = await supabase
      .from('tenant_gallery')
      .insert({
        tenant_id: tenantId,
        image_url: imageUrl,
        caption: caption || null,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/appearance');
    return { success: true, item: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Elimina un elemento de la galería de fotos
 */
export async function deleteGalleryItemAction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('tenant_gallery').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/appearance');
  return { success: true };
}

/**
 * Crea o edita un testimonio en `tenant_testimonials`
 */
export async function saveTestimonialAction(testimonial: {
  id?: string;
  client_name: string;
  client_avatar?: string | null;
  rating: number;
  comment: string;
  display_order?: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autenticado' };

  try {
    const { tenantId } = await getOrCreateTenantForUser(supabase, user);

    const payload: any = {
      tenant_id: tenantId,
      client_name: testimonial.client_name,
      client_avatar: testimonial.client_avatar || null,
      rating: Math.max(1, Math.min(5, testimonial.rating)),
      comment: testimonial.comment,
      display_order: testimonial.display_order || 1,
    };

    if (testimonial.id && !testimonial.id.startsWith('t-')) {
      payload.id = testimonial.id;
    }

    const { data, error } = await supabase
      .from('tenant_testimonials')
      .upsert(payload)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/appearance');
    return { success: true, item: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Elimina un testimonio por id
 */
export async function deleteTestimonialAction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('tenant_testimonials').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/appearance');
  return { success: true };
}
