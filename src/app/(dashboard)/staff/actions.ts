'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createStaffAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const color = (formData.get('color') as string) || '#6366f1';
  const avatarFile = formData.get('avatar') as File | null;
  const avatarUrlInput = (formData.get('avatar_url') as string) || null;
  const removeAvatar = formData.get('remove_avatar') === 'true';

  if (!name) {
    return { error: 'Por favor ingresa el nombre del especialista.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: 'No se encontró el negocio' };

  let avatar_url: string | null = removeAvatar ? null : avatarUrlInput;

  if (!removeAvatar && avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() || 'png';
    const filePath = `${profile.tenant_id}/staff_${Date.now()}.${ext}`;

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

  const { data: staff, error } = await supabase
    .from('staff')
    .insert({
      tenant_id: profile.tenant_id,
      name,
      email,
      phone,
      color,
      avatar_url,
      is_active: true,
    })
    .select('id')
    .single();

  if (error || !staff) {
    return { error: 'Error al agregar el personal: ' + (error?.message || '') };
  }

  // Generar horarios de atención por defecto para el nuevo miembro (Lun-Sáb 09:00 - 18:00)
  const defaultHours: Array<{
    tenant_id: string;
    staff_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    break_start?: string | null;
    break_end?: string | null;
    is_day_off: boolean;
  }> = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    tenant_id: profile.tenant_id,
    staff_id: staff.id,
    day_of_week: dayOfWeek,
    start_time: '09:00:00',
    end_time: '18:00:00',
    break_start: '13:00:00',
    break_end: '14:00:00',
    is_day_off: false,
  }));

  defaultHours.push({
    tenant_id: profile.tenant_id,
    staff_id: staff.id,
    day_of_week: 0,
    start_time: '09:00:00',
    end_time: '18:00:00',
    break_start: null,
    break_end: null,
    is_day_off: true,
  });

  await supabase.from('working_hours').insert(defaultHours);

  revalidatePath('/staff');
  return { success: true };
}

export async function updateStaffAction(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const color = (formData.get('color') as string) || '#6366f1';
  const avatarFile = formData.get('avatar') as File | null;
  const avatar_url = (formData.get('avatar_url') as string) || null;
  const removeAvatar = formData.get('remove_avatar') === 'true';

  if (!id || !name) {
    return { error: 'Por favor ingresa el nombre del especialista.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: 'No se encontró el negocio' };

  let finalAvatarUrl: string | null | undefined = undefined;

  if (removeAvatar) {
    finalAvatarUrl = null;
  } else if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() || 'png';
    const filePath = `${profile.tenant_id}/staff_${Date.now()}.${ext}`;

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
    name,
    email,
    phone,
    color,
  };
  if (finalAvatarUrl !== undefined) {
    updatePayload.avatar_url = finalAvatarUrl;
  }

  const { error } = await supabase
    .from('staff')
    .update(updatePayload)
    .eq('id', id);

  if (error) {
    return { error: 'Error al actualizar el especialista: ' + error.message };
  }

  revalidatePath('/staff');
  return { success: true };
}

export async function deleteStaffAction(staffId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { error } = await supabase.from('staff').delete().eq('id', staffId);

  if (error) {
    return { error: 'Error al eliminar al miembro: ' + error.message };
  }

  revalidatePath('/staff');
  return { success: true };
}
