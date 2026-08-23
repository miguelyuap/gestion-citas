'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Función para limpiar y formatear un slug
 */
export async function sanitizeSlug(input: string): Promise<string> {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('placeholder') || key.includes('placeholder')) return false;
  if (url.includes('your-project') || key.includes('your-anon-key')) return false;
  return true;
}

/**
 * Verificar disponibilidad de un slug
 */
export async function checkSlugAvailability(rawSlug: string): Promise<{
  available: boolean;
  slug: string;
  message?: string;
}> {
  const slug = await sanitizeSlug(rawSlug);

  if (!slug || slug.length < 3) {
    return {
      available: false,
      slug,
      message: 'El identificador debe tener al menos 3 caracteres.',
    };
  }

  if (!isSupabaseConfigured()) {
    return { available: true, slug };
  }

  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return {
        available: false,
        slug,
        message: 'Este identificador ya está siendo utilizado por otro negocio.',
      };
    }
  } catch (e) {
    // Graceful fallback si no hay red o fallo de fetch
  }

  return { available: true, slug };
}

/**
 * Acción de Inicio de Sesión
 */
export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string || '').trim();
  const password = (formData.get('password') as string || '').trim();

  if (!email || !password) {
    return { error: 'Por favor ingresa tu correo y contraseña.' };
  }

  if (!isSupabaseConfigured()) {
    // Si la BD de Supabase aún no está configurada con credenciales reales en .env.local, permitir acceso de prueba
    return { success: true };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Login Error:', error);
      let friendlyError = error.message || 'Correo o contraseña incorrectos.';

      const msg = (error.message || '').toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
        friendlyError = 'Correo o contraseña incorrectos.';
      } else if (msg.includes('email not confirmed')) {
        friendlyError = 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.';
      } else if (msg.includes('too many requests')) {
        friendlyError = 'Demasiados intentos fallidos. Inténtalo de nuevo en unos minutos.';
      }

      return { error: friendlyError };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error de conexión con Supabase:', err);
    if (err?.message?.includes('fetch failed') || err?.code === 'ENOTFOUND') {
      return { error: 'No se pudo establecer conexión con el servidor de Supabase. Por favor verifica tu conexión a internet o las credenciales en .env.local.' };
    }
    return { error: err?.message || 'Ocurrió un error al procesar el inicio de sesión.' };
  }
}

/**
 * Acción de Registro de Nuevo Negocio (Tenant + Owner)
 */
export async function registerTenantAction(formData: FormData) {
  const businessName = (formData.get('businessName') as string || '').trim();
  const slugInput = (formData.get('slug') as string || '').trim();
  const fullName = (formData.get('fullName') as string || '').trim();
  const email = (formData.get('email') as string || '').trim();
  const password = (formData.get('password') as string || '').trim();
  const phone = (formData.get('phone') as string || '').trim();

  // Validaciones backend obligatorias
  if (!businessName) {
    return { error: 'El nombre del negocio es obligatorio.' };
  }

  if (!fullName) {
    return { error: 'El nombre del propietario es obligatorio.' };
  }

  if (!email || !email.includes('@')) {
    return { error: 'Ingresa un correo electrónico válido.' };
  }

  if (!password || password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  const slug = await sanitizeSlug(slugInput || businessName);

  if (!slug || slug.length < 3) {
    return { error: 'El enlace de reservas (slug) debe tener al menos 3 caracteres válidos.' };
  }

  if (!isSupabaseConfigured()) {
    // Si Supabase no está configurado aún, simulamos registro exitoso
    return {
      success: true,
      requiresEmailConfirmation: false,
      email,
    };
  }

  try {
    const supabase = await createClient();

    // 1. Verificar disponibilidad de Slug en Base de Datos
    const { data: existingSlug } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingSlug) {
      return { error: 'Este identificador ya está siendo utilizado. Por favor elige otro para tu negocio.' };
    }

    // 2. Registrar usuario en Supabase Auth
    const headerStore = await headers();
    const host = headerStore.get('host') || 'localhost:3000';
    const protocol = headerStore.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = headerStore.get('origin') || `${protocol}://${host}`;
    const emailRedirectTo = `${origin}/auth/callback`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName,
          business_name: businessName,
          slug,
          phone,
        },
      },
    });

    if (authError) {
      console.error('Supabase SignUp Error:', authError);
      let friendlyError = authError.message || 'No pudimos completar el registro. Inténtalo nuevamente.';

      const msg = authError.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('user_already_exists')) {
        friendlyError = 'Este correo electrónico ya está registrado. Por favor inicia sesión.';
      } else if (msg.includes('password')) {
        friendlyError = 'La contraseña no cumple con las reglas de seguridad requeridas.';
      } else if (msg.includes('email')) {
        friendlyError = 'El correo electrónico proporcionado no es válido.';
      }

      return { error: friendlyError };
    }

    if (!authData.user) {
      return { error: 'No se pudo crear la cuenta de usuario. Inténtalo de nuevo.' };
    }

    const userId = authData.user.id;

    // 3. Fallback: Si la sesión existe (confirmación deshabilitada)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile && authData.session) {
      const { data: tenant } = await supabase
        .from('tenants')
        .insert({
          name: businessName,
          slug,
          email,
          phone,
          is_active: true,
        })
        .select('id')
        .single();

      if (tenant) {
        await supabase.from('profiles').insert({
          id: userId,
          tenant_id: tenant.id,
          full_name: fullName,
          role: 'owner',
        });

        const { data: staff } = await supabase
          .from('staff')
          .insert({
            tenant_id: tenant.id,
            profile_id: userId,
            name: fullName,
            email,
            phone,
            color: '#4f46e5',
            is_active: true,
          })
          .select('id')
          .single();

        if (staff) {
          type WorkingHourInsert = {
            tenant_id: string;
            staff_id: string;
            day_of_week: number;
            start_time: string;
            end_time: string;
            break_start: string | null;
            break_end: string | null;
            is_day_off: boolean;
          };

          const defaultHours: WorkingHourInsert[] = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
            tenant_id: tenant.id,
            staff_id: staff.id,
            day_of_week: dayOfWeek,
            start_time: '09:00:00',
            end_time: '18:00:00',
            break_start: '13:00:00',
            break_end: '14:00:00',
            is_day_off: false,
          }));
          defaultHours.push({
            tenant_id: tenant.id,
            staff_id: staff.id,
            day_of_week: 0,
            start_time: '09:00:00',
            end_time: '18:00:00',
            break_start: null,
            break_end: null,
            is_day_off: true,
          });
          await supabase.from('working_hours').insert(defaultHours);
        }

        await supabase.from('tenant_settings').insert({ tenant_id: tenant.id });
        await supabase.from('tenant_theme').insert({ tenant_id: tenant.id });
        await supabase.from('tenant_socials').insert({ tenant_id: tenant.id });
      }
    }

    const requiresEmailConfirmation = !authData.session;

    return {
      success: true,
      requiresEmailConfirmation,
      email,
    };
  } catch (err: any) {
    console.error('Error de conexión en registro:', err);
    if (err?.message?.includes('fetch failed') || err?.code === 'ENOTFOUND') {
      return { error: 'No se pudo conectar con el servidor de Supabase. Revisa tu conexión a internet o la configuración en .env.local.' };
    }
    return { error: err?.message || 'Error inesperado durante el registro.' };
  }
}

/**
 * Cerrar Sesión
 */
export async function signOutAction() {
  if (!isSupabaseConfigured()) {
    redirect('/login');
  }
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (e) {
    // Ignore error
  }
  redirect('/login');
}
