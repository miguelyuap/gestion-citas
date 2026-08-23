import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
        }
      },
    },
  });
}

/**
 * Crea un cliente de Supabase independiente que NO altera las cookies del navegador.
 * Útil para validaciones y registros del portal de clientes sin afectar la sesión de administración.
 */
export async function createStandaloneClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createServerClient(url, key, {
    auth: {
      persistSession: false,
    },
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No-op: No mutar las cookies de respuesta de Next.js
      },
    },
  });
}

/**
 * Crea un cliente administrativo de Supabase para operaciones del servidor que requieran eludir RLS cuando sea necesario.
 */
export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createServerClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No-op
      },
    },
  });
}
