'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Por favor completa todos los campos' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message || 'Credenciales inválidas' };
  }

  redirect('/dashboard');
}

export async function registerTenantAction(formData: FormData) {
  const businessName = formData.get('businessName') as string;
  const slugInput = formData.get('slug') as string;
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;

  if (!businessName || !fullName || !email || !password) {
    return { error: 'Por favor completa los campos requeridos' };
  }

  // Generar o limpiar el slug para la URL del negocio (ej: "barberia-elite")
  const slug = (slugInput || businessName)
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const supabase = await createClient();

  // 1. Crear el usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        business_name: businessName,
      },
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'No se pudo crear la cuenta de usuario' };
  }

  const userId = authData.user.id;

  // 2. Verificar que el slug no exista
  const { data: existingSlug } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  const finalSlug = existingSlug ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug;

  // 3. Insertar el nuevo TENANT en la base de datos
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      name: businessName,
      slug: finalSlug,
      email,
      phone,
      timezone: 'America/Bogota',
      is_active: true,
    })
    .select('id')
    .single();

  if (tenantError || !tenant) {
    return { error: 'Error al registrar el negocio: ' + (tenantError?.message || '') };
  }

  // 4. Crear el PROFILE vinculado al Auth User y Tenant como 'owner'
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    tenant_id: tenant.id,
    full_name: fullName,
    role: 'owner',
  });

  if (profileError) {
    return { error: 'Error al crear el perfil de usuario: ' + profileError.message };
  }

  // 5. Crear el primer miembro del STAFF (el propietario)
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .insert({
      tenant_id: tenant.id,
      profile_id: userId,
      name: fullName,
      email,
      phone,
      color: '#6366f1',
      is_active: true,
    })
    .select('id')
    .single();

  // 6. Crear horarios iniciales por defecto (Lunes a Sábado 09:00 - 18:00 con descanso 13:00-14:00)
  if (staff) {
    const defaultHours: {
      tenant_id: string;
      staff_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      break_start?: string | null;
      break_end?: string | null;
      is_day_off: boolean;
    }[] = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
      tenant_id: tenant.id,
      staff_id: staff.id,
      day_of_week: dayOfWeek,
      start_time: '09:00:00',
      end_time: '18:00:00',
      break_start: '13:00:00',
      break_end: '14:00:00',
      is_day_off: false,
    }));

    // Domingo día libre por defecto
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

  // Redireccionar al panel de control recién creado
  redirect('/dashboard');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
