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

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase Login Error:', error);
    let friendlyError = error.message || 'Correo o contraseña incorrectos.';

    if (error.message?.includes('Invalid login credentials')) {
      friendlyError = 'Correo o contraseña incorrectos.';
    } else if (error.message?.includes('Email not confirmed')) {
      friendlyError = 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.';
    } else if (error.message?.includes('Too many requests')) {
      friendlyError = 'Demasiados intentos fallidos. Inténtalo de nuevo en unos minutos.';
    }

    return { error: friendlyError };
  }

  return { success: true };
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
  // Determinar dinámicamente el origen para la redirección del correo de confirmación (/auth/callback)
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

  // 3. Respaldo (Fallback): Si la sesión existe (confirmación deshabilitada en Supabase)
  // y el trigger por alguna razón no ha insertado el perfil aún, aseguramos la creación.
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!existingProfile && authData.session) {
    // Insertar Tenant si no existe
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
      // Insertar Perfil
      await supabase.from('profiles').insert({
        id: userId,
        tenant_id: tenant.id,
        full_name: fullName,
        role: 'owner',
      });

      // Insertar Staff inicial
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

      // Insertar Horarios
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

      // Insertar Tablas de Apariencia
      await supabase.from('tenant_settings').insert({ tenant_id: tenant.id });
      await supabase.from('tenant_theme').insert({ tenant_id: tenant.id });
      await supabase.from('tenant_socials').insert({ tenant_id: tenant.id });
    }
  }

  // Determinar si Supabase exige confirmación de correo
  // Si authData.session es null, el usuario requiere confirmar su email
  const requiresEmailConfirmation = !authData.session;

  return {
    success: true,
    requiresEmailConfirmation,
    email,
  };
}

/**
 * Cerrar Sesión
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
