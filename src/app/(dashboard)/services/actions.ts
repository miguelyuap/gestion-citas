'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function parseSpanishPrice(input: string): number {
  if (!input) return 0;
  let str = input.trim();

  if (str.includes('.') && str.includes(',')) {
    if (str.lastIndexOf('.') > str.lastIndexOf(',')) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(/\./g, '').replace(',', '.');
    }
  } else if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      str = str.replace(/\./g, '');
    }
  } else if (str.includes(',')) {
    const parts = str.split(',');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(',', '.');
    }
  }

  const val = parseFloat(str);
  return isNaN(val) ? 0 : val;
}

export async function createServiceAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const durationMinutes = parseInt(formData.get('durationMinutes') as string, 10);
  const bufferMinutes = parseInt((formData.get('bufferMinutes') as string) || '0', 10);
  
  const rawPriceStr = (formData.get('price') as string) || '';
  const price = parseSpanishPrice(rawPriceStr);
  const currency = (formData.get('currency') as string) || 'COP';

  if (!name || isNaN(durationMinutes) || price < 0) {
    return { error: 'Por favor ingresa un nombre, duración y precio válidos.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No tienes permisos para realizar esta acción.' };
  }

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

export async function updateServiceAction(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const durationMinutes = parseInt(formData.get('durationMinutes') as string, 10);
  const bufferMinutes = parseInt((formData.get('bufferMinutes') as string) || '0', 10);
  
  const rawPriceStr = (formData.get('price') as string) || '';
  const price = parseSpanishPrice(rawPriceStr);
  const currency = (formData.get('currency') as string) || 'COP';

  if (!id || !name || isNaN(durationMinutes) || price < 0) {
    return { error: 'Por favor ingresa un nombre, duración y precio válidos.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No tienes permisos para realizar esta acción.' };
  }

  const { error } = await supabase
    .from('services')
    .update({
      name,
      description,
      duration_minutes: durationMinutes,
      buffer_time_minutes: bufferMinutes,
      price,
      currency,
    })
    .eq('id', id);

  if (error) {
    return { error: 'Error al actualizar el servicio: ' + error.message };
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
