'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { registerClientShared } from '@/lib/services/client-registration.service';
import { getTenantIdForUser } from '@/lib/services/tenant-context.service';
import { Client } from '@/types/database';

export interface ClientWithStats extends Client {
  citasCount: number;
  ultimaCita: string;
  proximaCita: string;
  estado: 'Activo' | 'Inactivo' | 'Nuevo';
}

export interface AdminCreateClientInput {
  name: string;
  lastName?: string;
  email: string;
  phone: string;
  password?: string;
  notes?: string;
}

/**
 * Obtiene todos los clientes del tenant correspondiente al administrador autenticado
 */
export async function getAdminClientsAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado. Inicie sesión para continuar.', clients: [] };
  }

  const tenantId = await getTenantIdForUser(supabase, user);

  if (!tenantId) {
    return { error: 'No se encontró la empresa/tenant del usuario.', clients: [] };
  }

  // Consultar clientes junto con sus citas en Supabase
  const { data: clientsData, error } = await supabase
    .from('clients')
    .select(`
      *,
      appointments (
        id,
        start_time,
        status
      )
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener clientes:', error);
    return { error: 'Error al cargar clientes de Supabase: ' + error.message, clients: [] };
  }

  const now = new Date();

  const clientsWithStats: ClientWithStats[] = (clientsData || []).map((client: any) => {
    const apps = client.appointments || [];
    const validApps = apps.filter((a: any) => a.status !== 'cancelled');
    const citasCount = validApps.length;

    // Buscar la última cita (pasada o más reciente)
    const pastApps = validApps
      .filter((a: any) => new Date(a.start_time) <= now)
      .sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    const upcomingApps = validApps
      .filter((a: any) => new Date(a.start_time) > now)
      .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(a.start_time).getTime());

    let ultimaCita = 'Sin citas';
    if (pastApps.length > 0) {
      const d = new Date(pastApps[0].start_time);
      ultimaCita = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    let proximaCita = 'Sin agendar';
    if (upcomingApps.length > 0) {
      const d = new Date(upcomingApps[0].start_time);
      proximaCita = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    }

    let estado: 'Activo' | 'Inactivo' | 'Nuevo' = 'Nuevo';
    if (citasCount > 0) {
      estado = 'Activo';
    }

    const { appointments, ...clientFields } = client;

    return {
      ...clientFields,
      citasCount,
      ultimaCita,
      proximaCita,
      estado,
    };
  });

  return {
    success: true,
    clients: clientsWithStats,
  };
}

/**
 * Registra un nuevo cliente directamente desde el Dashboard Administrativo
 */
export async function createAdminClientAction(input: AdminCreateClientInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado.' };
  }

  const tenantId = await getTenantIdForUser(supabase, user);

  if (!tenantId) {
    return { error: 'No se encontró la empresa asociada al administrador.' };
  }

  const result = await registerClientShared(supabase, {
    tenantId,
    name: input.name,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    password: input.password,
    notes: input.notes,
    createdSource: 'admin_dashboard',
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath('/clients');
  revalidatePath('/appointments');
  revalidatePath('/');

  return {
    success: true,
    client: result.client,
  };
}
