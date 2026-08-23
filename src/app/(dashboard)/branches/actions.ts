'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at?: string;
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function getBranchesAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado', branches: [] };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.tenant_id) return { error: 'Negocio no encontrado', branches: [] };

  try {
    const { data: branches, error } = await supabase
      .from('branches')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Tabla branches aún no existe o error en DB:', error.message);
      return { branches: [], tenantId: profile.tenant_id };
    }

    return { branches: (branches as Branch[]) || [], tenantId: profile.tenant_id };
  } catch (err) {
    return { branches: [], tenantId: profile.tenant_id };
  }
}

export async function createBranchAction(formData: FormData) {
  const name = (formData.get('name') as string || '').trim();
  const address = (formData.get('address') as string || '').trim() || null;
  const phone = (formData.get('phone') as string || '').trim() || null;

  if (!name) {
    return { error: 'El nombre de la sucursal es obligatorio.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.tenant_id) return { error: 'Negocio no encontrado' };

  const { error } = await supabase.from('branches').insert({
    tenant_id: profile.tenant_id,
    name,
    address,
    phone,
    is_active: true,
  });

  if (error) {
    return { error: 'Error al crear sucursal: ' + error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateBranchAction(formData: FormData) {
  const id = formData.get('id') as string;
  const name = (formData.get('name') as string || '').trim();
  const address = (formData.get('address') as string || '').trim() || null;
  const phone = (formData.get('phone') as string || '').trim() || null;

  if (!id || !name) {
    return { error: 'El nombre de la sucursal es obligatorio.' };
  }

  if (!isValidUUID(id)) {
    return { success: true };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { error } = await supabase
    .from('branches')
    .update({ name, address, phone })
    .eq('id', id);

  if (error) {
    return { error: 'Error al actualizar sucursal: ' + error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteBranchAction(branchId: string, hasStaffAssigned: boolean = false) {
  if (hasStaffAssigned) {
    return { error: 'No se puede eliminar la sucursal porque tiene profesionales asignados. Puedes inhabilitarla cambiando su estado a Inactiva.' };
  }

  if (!isValidUUID(branchId)) {
    // Si no es un UUID válido (ej. mock local), simular éxito en cliente
    return { success: true };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  try {
    // Verificar si existen profesionales asociados a esta sucursal
    const { count: staffCount } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', branchId);

    if (staffCount && staffCount > 0) {
      return { error: 'No se puede eliminar la sucursal porque tiene profesionales asignados. Puedes inhabilitarla cambiando su estado a Inactiva.' };
    }

    const { error } = await supabase.from('branches').delete().eq('id', branchId);

    if (error) {
      if (error.message.includes('uuid') || error.code === '22P02') {
        return { success: true };
      }
      return { error: 'Error al eliminar sucursal: ' + error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: true };
  }
}

export async function toggleBranchStatusAction(branchId: string, currentStatus: boolean) {
  if (!isValidUUID(branchId)) {
    return { success: true };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { error } = await supabase
    .from('branches')
    .update({ is_active: !currentStatus })
    .eq('id', branchId);

  if (error) {
    return { error: 'Error al cambiar estado de sucursal: ' + error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
