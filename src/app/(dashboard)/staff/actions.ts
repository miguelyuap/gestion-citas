'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getTenantIdForUser } from '@/lib/services/tenant-context.service';

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Obtiene los profesionales del tenant del administrador autenticado junto con sus citas y sucursales
 */
export async function getStaffDataAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado. Inicie sesión para continuar.', staffList: [], branches: [] };
  }

  const tenantId = await getTenantIdForUser(supabase, user);

  if (!tenantId) {
    return { error: 'No se encontró la empresa/tenant del usuario.', staffList: [], branches: [] };
  }

  // 1. Obtener sucursales del tenant
  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name');

  // 2. Obtener lista de profesionales con sus citas contadas
  const { data: staffList, error } = await supabase
    .from('staff')
    .select(`
      *,
      appointments (
        id,
        status
      )
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al obtener profesionales:', error);
    return { error: 'Error al obtener profesionales: ' + error.message, staffList: [], branches: branches || [] };
  }

  const processedStaff = (staffList || []).map((p: any) => {
    const validApps = (p.appointments || []).filter((a: any) => a.status !== 'cancelled');
    const { appointments, ...staffFields } = p;
    return {
      ...staffFields,
      citasCount: validApps.length,
    };
  });

  return {
    success: true,
    staffList: processedStaff,
    branches: branches || [],
  };
}

/**
 * Crea un nuevo profesional registrado por el administrador
 */
export async function createStaffAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const color = (formData.get('color') as string) || '#4f46e5';
  const branch_id_input = (formData.get('branch_id') as string) || null;

  const avatarFile = formData.get('avatar') as File | null;
  const avatarUrlInput = (formData.get('avatar_url') as string) || null;
  const removeAvatar = formData.get('remove_avatar') === 'true';

  if (!name || name.trim().length === 0) {
    return { error: 'Por favor ingresa el nombre del especialista.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const tenantId = await getTenantIdForUser(supabase, user);

  if (!tenantId) return { error: 'No se encontró el negocio' };

  let avatar_url: string | null = removeAvatar ? null : avatarUrlInput;

  if (!removeAvatar && avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() || 'png';
    const filePath = `${tenantId}/staff_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('tenant-assets')
      .upload(filePath, avatarFile, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(filePath);
      avatar_url = publicUrlData.publicUrl;
    }
  }

  const insertPayload: any = {
    tenant_id: tenantId,
    name: name.trim(),
    email: email ? email.trim() : null,
    phone: phone ? phone.trim() : null,
    color,
    avatar_url,
    branch_id: branch_id_input && isValidUUID(branch_id_input) ? branch_id_input : null,
    is_active: true,
  };

  const { data: staff, error } = await supabase
    .from('staff')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error || !staff) {
    return { error: 'Error al agregar el profesional: ' + (error?.message || '') };
  }

  // Generar horarios por defecto para el profesional (Lunes a Sábado)
  const defaultHours: Array<any> = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    tenant_id: tenantId,
    staff_id: staff.id,
    day_of_week: dayOfWeek,
    start_time: '09:00:00',
    end_time: '18:00:00',
    break_start: '13:00:00',
    break_end: '14:00:00',
    is_day_off: false,
  }));

  defaultHours.push({
    tenant_id: tenantId,
    staff_id: staff.id,
    day_of_week: 0,
    start_time: '09:00:00',
    end_time: '18:00:00',
    break_start: null,
    break_end: null,
    is_day_off: true,
  });

  await supabase.from('working_hours').insert(defaultHours);

  revalidatePath('/dashboard');
  revalidatePath('/staff');
  revalidatePath('/schedules');
  return { success: true, staff };
}

/**
 * Actualiza un profesional existente
 */
export async function updateStaffAction(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const color = (formData.get('color') as string) || '#4f46e5';
  const branch_id_input = (formData.get('branch_id') as string) || null;

  const avatarFile = formData.get('avatar') as File | null;
  const avatar_url = (formData.get('avatar_url') as string) || null;
  const removeAvatar = formData.get('remove_avatar') === 'true';

  if (!id || !name) {
    return { error: 'Por favor ingresa el nombre del profesional.' };
  }

  if (!isValidUUID(id)) {
    return { success: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const tenantId = await getTenantIdForUser(supabase, user);

  if (!tenantId) return { error: 'No se encontró el negocio' };

  let finalAvatarUrl: string | null | undefined = undefined;

  if (removeAvatar) {
    finalAvatarUrl = null;
  } else if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() || 'png';
    const filePath = `${tenantId}/staff_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('tenant-assets')
      .upload(filePath, avatarFile, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(filePath);
      finalAvatarUrl = publicUrlData.publicUrl;
    }
  } else if (avatar_url !== null) {
    finalAvatarUrl = avatar_url;
  }

  const updatePayload: any = {
    name: name.trim(),
    email: email ? email.trim() : null,
    phone: phone ? phone.trim() : null,
    color,
    branch_id: branch_id_input && isValidUUID(branch_id_input) ? branch_id_input : null,
  };

  if (finalAvatarUrl !== undefined) {
    updatePayload.avatar_url = finalAvatarUrl;
  }

  const { data: updatedStaff, error } = await supabase
    .from('staff')
    .update(updatePayload)
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select('*')
    .single();

  if (error) {
    return { error: 'Error al actualizar el profesional: ' + error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/staff');
  revalidatePath('/schedules');
  return { success: true, staff: updatedStaff };
}

/**
 * Elimina un profesional
 */
export async function deleteStaffAction(staffId: string) {
  if (!isValidUUID(staffId)) {
    return { success: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const tenantId = await getTenantIdForUser(supabase, user);

  if (!tenantId) return { error: 'No se encontró el negocio' };

  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', staffId)
    .eq('tenant_id', tenantId);

  if (error) {
    return { error: 'Error al eliminar al profesional: ' + error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/staff');
  revalidatePath('/schedules');
  return { success: true };
}
