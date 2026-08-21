'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { registerClientShared } from '@/lib/services/client-registration.service';

export interface ClientRegisterInput {
  slug: string;
  name: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
}

export interface ClientLoginInput {
  slug: string;
  email: string;
  password: string;
}

/**
 * Registra a un nuevo cliente en el tenant específico usando el servicio compartido
 */
export async function registerClientAction(input: ClientRegisterInput) {
  const { slug, name, lastName, email, phone, password } = input;

  if (!slug) {
    return { error: 'Negocio no especificado.' };
  }

  const supabase = await createClient();

  // 1. Obtener Tenant por Slug
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (tenantErr || !tenant) {
    return { error: 'El negocio no existe o se encuentra inactivo.' };
  }

  // 2. Invocar servicio compartido de creación de clientes
  const result = await registerClientShared(supabase, {
    tenantId: tenant.id,
    name,
    lastName,
    email,
    phone,
    password,
    createdSource: 'client_portal',
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath(`/${slug}`);

  return {
    success: true,
    user: result.user,
    client: result.client,
    requiresEmailConfirmation: result.requiresEmailConfirmation,
  };
}

/**
 * Inicia sesión para un cliente
 */
export async function loginClientAction(input: ClientLoginInput) {
  const { slug, email, password } = input;

  if (!email || !password) {
    return { error: 'Por favor ingresa tu correo y contraseña.' };
  }

  const supabase = await createClient();

  // 1. Obtener Tenant por Slug
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!tenant) {
    return { error: 'Negocio no encontrado.' };
  }

  const cleanEmail = email.toLowerCase().trim();

  // 2. Intentar autenticación con Supabase Auth primero
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  let user = authData?.user || null;

  // 3. Buscar el registro de cliente en la tabla `clients`
  let { data: clientRecord } = await supabase
    .from('clients')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('email', cleanEmail)
    .maybeSingle();

  if (authErr && !clientRecord) {
    let friendly = 'Correo o contraseña incorrectos.';
    if (authErr.message.toLowerCase().includes('email not confirmed')) {
      friendly = 'Por favor confirma tu correo electrónico antes de ingresar.';
    }
    return { error: friendly };
  }

  if (user && clientRecord && !clientRecord.user_id) {
    await supabase
      .from('clients')
      .update({ user_id: user.id })
      .eq('id', clientRecord.id);
  }

  // Guardar cookie de sesión del portal del cliente
  if (clientRecord?.id) {
    const cookieStore = await cookies();
    cookieStore.set('client_session', clientRecord.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });
  }

  revalidatePath(`/${slug}`);

  return { success: true, user, client: clientRecord };
}

/**
 * Obtiene el cliente actualmente autenticado para el tenant activo
 */
export async function getCurrentClientAction(tenantSlug: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const clientSessionId = cookieStore.get('client_session')?.value;

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .maybeSingle();

  if (!tenant) {
    return { authenticated: false, user: null, client: null };
  }

  // 1. Si existe cookie explícita de sesión de cliente (ej: Admin probando login de cliente)
  if (clientSessionId) {
    const { data: clientFromCookie } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientSessionId)
      .eq('tenant_id', tenant.id)
      .maybeSingle();

    if (clientFromCookie) {
      return {
        authenticated: true,
        user: null,
        client: clientFromCookie,
      };
    }
  }

  // 2. Si no hay cookie de cliente, verificar usuario de Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authenticated: false, user: null, client: null };
  }

  // Verificar si el usuario actualmente autenticado en Supabase Auth es un Admin/Staff
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  // Si es un Admin navegando el portal público y NO ha iniciado sesión explícita de cliente con cookie, se muestra desconectado
  if (adminProfile) {
    return { authenticated: false, user: null, client: null };
  }

  // Buscar cliente vinculado por user_id o email para usuarios cliente comunes
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('tenant_id', tenant.id)
    .or(`user_id.eq.${user.id},email.eq.${user.email?.toLowerCase().trim()}`)
    .maybeSingle();

  return {
    authenticated: true,
    user,
    client: client || {
      id: '',
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente',
      email: user.email || '',
      phone: user.user_metadata?.phone || '',
      tenant_id: tenant.id,
      user_id: user.id,
    },
  };
}

/**
 * Actualiza el perfil del cliente
 */
export async function updateClientProfileAction(input: {
  slug: string;
  name: string;
  phone: string;
  email: string;
}) {
  const { slug, name, phone, email } = input;
  const supabase = await createClient();

  const currentClientRes = await getCurrentClientAction(slug);
  if (!currentClientRes.authenticated || !currentClientRes.client) {
    return { error: 'Debes iniciar sesión para actualizar tu perfil.' };
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) return { error: 'Negocio no encontrado.' };

  const { data: updated, error } = await supabase
    .from('clients')
    .upsert({
      id: currentClientRes.client.id || undefined,
      user_id: currentClientRes.user?.id || currentClientRes.client.user_id || null,
      tenant_id: tenant.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
    })
    .select('*')
    .single();

  if (error) {
    return { error: 'Error al actualizar perfil: ' + error.message };
  }

  revalidatePath(`/${slug}`);
  return { success: true, client: updated };
}

/**
 * Cierra la sesión del cliente sin afectar la sesión del Administrador
 */
export async function logoutClientAction(slug: string) {
  const supabase = await createClient();

  // 1. Eliminar la cookie de sesión del cliente
  const cookieStore = await cookies();
  cookieStore.delete('client_session');

  // 2. Si el usuario autenticado en Supabase Auth NO es Administrador, cerrar la sesión de Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminProfile) {
      await supabase.auth.signOut();
    }
  }

  revalidatePath(`/${slug}`);
  return { success: true };
}
