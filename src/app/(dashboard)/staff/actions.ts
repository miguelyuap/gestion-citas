'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createStaffAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const color = (formData.get('color') as string) || '#6366f1';

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

  const { data: staff, error } = await supabase
    .from('staff')
    .insert({
      tenant_id: profile.tenant_id,
      name,
      email,
      phone,
      color,
      is_active: true,
    })
    .select('id')
    .single();

  if (error || !staff) {
    return { error: 'Error al agregar el personal: ' + (error?.message || '') };
  }

  // Generar horarios de atención por defecto para el nuevo miembro (Lun-Sáb 09:00 - 18:00)
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
