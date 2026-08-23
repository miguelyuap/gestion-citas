import { SupabaseClient } from '@supabase/supabase-js';
import { Client } from '@/types/database';

export interface SharedRegisterClientInput {
  tenantId: string;
  name: string;
  lastName?: string;
  email: string;
  phone: string;
  password?: string;
  notes?: string;
  createdSource?: 'client_portal' | 'admin_dashboard';
}

export interface SharedRegisterClientResult {
  success?: boolean;
  error?: string;
  client?: Client;
  user?: any;
  requiresEmailConfirmation?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Servicio compartido de registro de clientes para OmniCitas.
 * Utilizado de manera consistente por el portal de clientes y el Dashboard Administrativo.
 */
export async function registerClientShared(
  supabase: SupabaseClient,
  input: SharedRegisterClientInput
): Promise<SharedRegisterClientResult> {
  const { tenantId, name, lastName, email, phone, password, notes, createdSource = 'admin_dashboard' } = input;

  // 1. Validaciones básicas de entrada
  if (!name || name.trim().length === 0) {
    return { error: 'El nombre del cliente es obligatorio.' };
  }

  if (!email || email.trim().length === 0) {
    return { error: 'El correo electrónico es obligatorio.' };
  }

  if (!phone || phone.trim().length === 0) {
    return { error: 'El número de teléfono/WhatsApp es obligatorio.' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanPhone = phone.trim();
  const fullName = `${name.trim()} ${lastName ? lastName.trim() : ''}`.trim();

  // Validar formato de correo electrónico
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { error: 'El formato del correo electrónico no es válido.' };
  }

  // Validar contraseña si se proporciona
  if (password && password.trim().length > 0) {
    if (password.length < 6) {
      return { error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
  }

  // 2. Verificar si el negocio existe
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('id', tenantId)
    .maybeSingle();

  if (tenantErr || !tenant) {
    return { error: 'El negocio especificado no existe o no está activo.' };
  }

  // 3. Verificar si ya existe un registro en `clients` para este tenant
  const { data: existingClient } = await supabase
    .from('clients')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('email', cleanEmail)
    .maybeSingle();

  // Si ya existe el cliente en este tenant
  if (existingClient) {
    if (existingClient.user_id && password && password.trim().length > 0) {
      return { error: 'Este correo electrónico ya está registrado con una cuenta de usuario. Por favor inicia sesión.' };
    }

    if (existingClient.user_id && !password) {
      return { error: 'Ya existe un cliente registrado con este correo electrónico.' };
    }

    // Si existe el cliente en la tabla pero aún NO tiene un user_id vinculado en Auth, y se provee contraseña:
    if (!existingClient.user_id && password && password.trim().length > 0) {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: cleanPhone,
            role: 'client',
            tenant_id: tenantId,
          },
        },
      });

      if (authErr) {
        let msg = authErr.message;
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user_already_exists')) {
          msg = 'Este correo electrónico ya está registrado en el sistema.';
        }
        return { error: msg };
      }

      if (!authData.user) {
        return { error: 'No se pudo crear el usuario de autenticación.' };
      }

      const { data: updatedClient, error: updateErr } = await supabase
        .from('clients')
        .update({
          user_id: authData.user.id,
          name: fullName,
          phone: cleanPhone,
          notes: notes !== undefined ? notes.trim() : existingClient.notes,
        })
        .eq('id', existingClient.id)
        .select('*')
        .single();

      if (updateErr) {
        return { error: 'Error actualizando información del cliente: ' + updateErr.message };
      }

      return {
        success: true,
        client: updatedClient as Client,
        user: authData.user,
        requiresEmailConfirmation: !authData.session,
      };
    }

    // Si existe el cliente sin user_id y no se proporciona contraseña (ej. actualización directa)
    const { data: updatedClient, error: updateErr } = await supabase
      .from('clients')
      .update({
        name: fullName,
        phone: cleanPhone,
        notes: notes !== undefined ? notes.trim() : existingClient.notes,
      })
      .eq('id', existingClient.id)
      .select('*')
      .single();

    if (updateErr) {
      return { error: 'Error actualizando cliente: ' + updateErr.message };
    }

    return {
      success: true,
      client: updatedClient as Client,
    };
  }

  // 4. Si el cliente NO existe en este tenant
  let userId: string | null = null;
  let authUser: any = null;

  if (password && password.trim().length > 0) {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: cleanPhone,
          role: 'client',
          tenant_id: tenantId,
        },
      },
    });

    if (authErr) {
      let msg = authErr.message;
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user_already_exists')) {
        msg = 'Este correo electrónico ya está registrado en el sistema.';
      }
      return { error: msg };
    }

    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
      return { error: 'Este correo electrónico ya está registrado en el sistema.' };
    }

    if (authData.user) {
      userId = authData.user.id;
      authUser = authData.user;
    }
  }

  // 5. Insertar nuevo registro en `clients`
  const { data: insertedClient, error: insertErr } = await supabase
    .from('clients')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      name: fullName,
      email: cleanEmail,
      phone: cleanPhone,
      notes: notes ? notes.trim() : null,
    })
    .select('*')
    .single();

  if (insertErr) {
    return { error: 'Error creando el registro de cliente: ' + insertErr.message };
  }

  return {
    success: true,
    client: insertedClient as Client,
    user: authUser,
    requiresEmailConfirmation: authUser ? !authUser.session : false,
  };
}
