import { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Obtiene de forma resiliente el tenant_id del usuario autenticado.
 * Si el usuario no tiene un registro en `profiles` o su perfil fue eliminado,
 * intenta recuperarlo de los metadatos de Auth, personal o del primer tenant activo,
 * auto-reparando la tabla `profiles`.
 */
export async function getTenantIdForUser(
  supabase: SupabaseClient,
  user: User
): Promise<string | null> {
  if (!user || !user.id) return null;

  // 1. Intentar consultar directamente el perfil del usuario por su user.id
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.tenant_id) {
    return profile.tenant_id;
  }

  // 2. Buscar en los metadatos del usuario de Supabase Auth
  const metaTenantId = user.user_metadata?.tenant_id || user.app_metadata?.tenant_id;
  if (metaTenantId) {
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
    return metaTenantId;
  }

  // 3. Buscar en la tabla `staff` por correo electrónico
  if (user.email) {
    const { data: staffMember } = await supabase
      .from('staff')
      .select('tenant_id')
      .eq('email', user.email.toLowerCase().trim())
      .maybeSingle();

    if (staffMember?.tenant_id) {
      const userName = user.user_metadata?.full_name || user.email.split('@')[0];
      await supabase.from('profiles').upsert(
        {
          id: user.id,
          tenant_id: staffMember.tenant_id,
          full_name: userName,
          role: 'admin',
        },
        { onConflict: 'id' }
      );
      return staffMember.tenant_id;
    }
  }

  // 4. Buscar el primer tenant activo en la base de datos (fallback multi-tenant / desarrollo)
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

  return null;
}
