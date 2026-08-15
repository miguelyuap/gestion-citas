'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createServiceAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const durationMinutes = parseInt(formData.get('durationMinutes') as string, 10);
  const bufferMinutes = parseInt(formData.get('bufferMinutes') as string || '0', 10);
  const price = parseFloat(formData.get('price') as string);
  const currency = (formData.get('currency') as string) || 'USD';

  if (!name || isNaN(durationMinutes) || isNaN(price)) {
    return { error: 'Por favor ingresa un nombre, duración y precio válidos.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No tienes permisos para realizar esta acción.' };
  }

  // Obtenemos el tenant del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) {
    return { error: 'No se encontró un negocio asociado a tu cuenta.' };
  }

  const { error } = await supabase.from('services').insert({
    tenant_id: profile.tenant_id,
    name,
    description,
    duration_minutes: durationMinutes,
    buffer_time_minutes: bufferMinutes,
    price,
    currency,
    is_active: true,
  });

  if (error) {
    return { error: 'Error al guardar el servicio: ' + error.message };
  }

  revalidatePath('/services');
  return { success: true };
}

export async function deleteServiceAction(serviceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);

  if (error) {
    return { error: 'Error al eliminar el servicio: ' + error.message };
  }

  revalidatePath('/services');
  return { success: true };
}

export async function toggleServiceStatusAction(serviceId: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { error } = await supabase
    .from('services')
    .update({ is_active: !currentStatus })
    .eq('id', serviceId);

  if (error) {
    return { error: 'Error al actualizar el estado: ' + error.message };
  }

  revalidatePath('/services');
  return { success: true };
}
