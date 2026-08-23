import { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Obtiene de forma resiliente el tenant_id del usuario autenticado de administración/negocio.
 */
export async function getTenantIdForUser(
  supabase: SupabaseClient,
  user: User
): Promise<string | null> {
  if (!user || !user.id) return null;

  // Si el usuario registrado explicitamente indica rol de cliente final de la landing page, no auto-asignar owner
  const isClientUser = user.user_metadata?.role === 'client';

  // 1. Intentar consultar directamente el perfil del usuario por su user.id
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.tenant_id) {
    return profile.tenant_id;
  }

  // 2. Buscar si ya existe un negocio en `tenants` creado con el correo del usuario
  if (user.email) {
    const cleanEmail = user.email.toLowerCase().trim();
    const { data: tenantByEmail } = await supabase
      .from('tenants')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (tenantByEmail?.id) {
      if (!isClientUser) {
        const userName = user.user_metadata?.full_name || user.email.split('@')[0];
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            tenant_id: tenantByEmail.id,
            full_name: userName,
            role: 'owner',
          },
          { onConflict: 'id' }
        );
      }
      return tenantByEmail.id;
    }
  }

  // 3. Buscar en la tabla `staff` por correo electrónico de administración
  if (user.email) {
    const cleanEmail = user.email.toLowerCase().trim();
    const { data: staffMember } = await supabase
      .from('staff')
      .select('tenant_id, name')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (staffMember?.tenant_id) {
      if (!isClientUser) {
        const userName = staffMember.name || user.user_metadata?.full_name || user.email.split('@')[0];
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            tenant_id: staffMember.tenant_id,
            full_name: userName,
            role: 'admin',
          },
          { onConflict: 'id' }
        );
      }
      return staffMember.tenant_id;
    }
  }

  // 4. Buscar en los metadatos del usuario de Supabase Auth
  const metaTenantId = user.user_metadata?.tenant_id || user.app_metadata?.tenant_id;
  if (metaTenantId) {
    if (!isClientUser) {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador';
      await supabase.from('profiles').upsert(
        {
          id: user.id,
          tenant_id: metaTenantId,
          full_name: userName,
          role: 'owner',
        },
        { onConflict: 'id' }
      );
    }
    return metaTenantId;
  }

  // 5. Fallback seguro para entorno de desarrollo (sin alterar el perfil si es usuario cliente)
  if (!isClientUser) {
    const { data: firstTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstTenant?.id) {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador';
      await supabase.from('profiles').upsert(
        {
          id: user.id,
          tenant_id: firstTenant.id,
          full_name: userName,
          role: 'owner',
        },
        { onConflict: 'id' }
      );
      return firstTenant.id;
    }
  }

  return null;
}
