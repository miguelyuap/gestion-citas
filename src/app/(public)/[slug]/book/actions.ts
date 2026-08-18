'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface CreatePublicBookingInput {
  slug: string;
  serviceId: string;
  staffId: string;
  startTimeIso: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}

export async function createPublicAppointmentAction(input: CreatePublicBookingInput) {
  const { slug, serviceId, staffId, startTimeIso, clientName, clientEmail, clientPhone, notes } =
    input;

  if (!slug || !serviceId || !staffId || !startTimeIso || !clientName || !clientEmail || !clientPhone) {
    return { error: 'Por favor completa todos los campos del formulario.' };
  }

  const startDate = new Date(startTimeIso);
  if (isNaN(startDate.getTime())) {
    return { error: 'La fecha y hora seleccionadas no son válidas.' };
  }

  if (startDate < new Date()) {
    return { error: 'No es posible agendar citas en un horario que ya ha pasado.' };
  }

  const supabase = await createClient();

  // 1. Buscar Tenant por Slug
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (tenantErr || !tenant) {
    return { error: 'El negocio no existe o se encuentra inactivo.' };
  }

  const tenantId = tenant.id;

  // 2. Buscar Servicio
  const { data: service, error: srvErr } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .maybeSingle();

  if (srvErr || !service) {
    return { error: 'El servicio seleccionado no está disponible.' };
  }

  // 3. Buscar Profesional
  const { data: staff, error: staffErr } = await supabase
    .from('staff')
    .select('*')
    .eq('id', staffId)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .maybeSingle();

  if (staffErr || !staff) {
    return { error: 'El profesional seleccionado no se encuentra disponible.' };
  }

  // 4. Duraciones y cálculo del fin de la cita (incluyendo buffer)
  const totalDurationMinutes = service.duration_minutes + (service.buffer_time_minutes || 0);
  const endDate = new Date(startDate.getTime() + totalDurationMinutes * 60 * 1000);

  // 5. Validación de Horario y Disponibilidad en Backend (Regla de Prioridad)
  const dayOfWeek = startDate.getDay(); // 0=Domingo, 1=Lunes...

  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('tenant_id', tenantId)
    .or(`staff_id.eq.${staffId},staff_id.is.null`)
    .eq('day_of_week', dayOfWeek);

  const specificWh = workingHours?.find((wh) => wh.staff_id === staffId);
  const generalWh = workingHours?.find((wh) => wh.staff_id === null);
  const activeWh = specificWh || generalWh;

  if (!activeWh || activeWh.is_day_off) {
    return {
      error: `El profesional ${staff.name} no labora en la fecha seleccionada.`,
    };
  }

  // Comprobar rango de la jornada
  const parseTimeOnDate = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(startDate);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const workStart = parseTimeOnDate(activeWh.start_time);
  const workEnd = parseTimeOnDate(activeWh.end_time);

  if (startDate < workStart || endDate > workEnd) {
    return {
      error: `El horario elegido está fuera de la jornada laboral de ${staff.name} (${activeWh.start_time.substring(0, 5)} - ${activeWh.end_time.substring(0, 5)}).`,
    };
  }

  // Comprobar descanso
  if (activeWh.break_start && activeWh.break_end) {
    const breakStart = parseTimeOnDate(activeWh.break_start);
    const breakEnd = parseTimeOnDate(activeWh.break_end);

    if (startDate < breakEnd && endDate > breakStart) {
      return {
        error: `El horario seleccionado coincide con el descanso/almuerzo de ${staff.name}.`,
      };
    }
  }

  // Comprobar citas existentes en la DB
  const { data: existingApps } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('tenant_id', tenantId)
    .eq('staff_id', staffId)
    .neq('status', 'cancelled');

  if (existingApps) {
    const overlaps = existingApps.some((app) => {
      const appStart = new Date(app.start_time);
      const appEnd = new Date(app.end_time);
      return startDate < appEnd && endDate > appStart;
    });

    if (overlaps) {
      return {
        error: `El horario ya no se encuentra disponible. Por favor elige otro turno.`,
      };
    }
  }

  // 6. Obtener o crear Cliente en Supabase
  let clientId: string;

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('email', clientEmail.toLowerCase().trim())
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const { data: newClient, error: clientErr } = await supabase
      .from('clients')
      .insert({
        tenant_id: tenantId,
        name: clientName.trim(),
        email: clientEmail.toLowerCase().trim(),
        phone: clientPhone.trim(),
      })
      .select('id')
      .single();

    if (clientErr || !newClient) {
      return { error: 'Error al registrar tus datos de contacto: ' + (clientErr?.message || '') };
    }
    clientId = newClient.id;
  }

  // 7. Insertar la cita
  const { data: newApp, error: appErr } = await supabase
    .from('appointments')
    .insert({
      tenant_id: tenantId,
      service_id: serviceId,
      staff_id: staffId,
      client_id: clientId,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: 'confirmed',
      total_price: service.price,
      notes: notes || '',
    })
    .select('*')
    .single();

  if (appErr || !newApp) {
    if (appErr?.code === '23505' || appErr?.message?.includes('no_overlapping_staff_appointments')) {
      return { error: 'Conflicto de reserva: Alguien más acaba de agendar este turno.' };
    }
    return { error: 'Error al confirmar la reserva: ' + (appErr?.message || '') };
  }

  // 8. Crear notificación de reserva
  await supabase.from('appointment_notifications').insert({
    tenant_id: tenantId,
    appointment_id: newApp.id,
    type: 'confirmation',
    channel: 'system',
    recipient_name: clientName,
    recipient_contact: clientEmail || clientPhone,
    title: `Reserva Online Confirmada - ${service.name}`,
    message: `Reserva confirmada para ${clientName} con ${staff.name} (${service.name}) el ${startDate.toLocaleString('es-CO')}.`,
    status: 'pending',
  });

  revalidatePath('/appointments');
  revalidatePath(`/${slug}/book`);

  return { success: true, appointment: newApp };
}
