'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { PersistentNotificationService } from '@/lib/services/persistent-notification.service';
import { sendServerWhatsAppNotification } from '@/lib/services/whatsapp-server.service';
import WhatsAppService from '@/lib/services/whatsapp.service';

export interface CreatePublicBookingInput {
  slug: string;
  serviceId: string;
  staffId: string;
  branchId?: string;
  startTimeIso: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}

export async function createPublicAppointmentAction(input: CreatePublicBookingInput) {
  const { slug, serviceId, staffId, branchId, startTimeIso, clientName, clientEmail, clientPhone, notes } =
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

  // Comprobar si hay un usuario autenticado para asociarlo al perfil de cliente
  const { data: { user: currentUser } } = await supabase.auth.getUser();

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

  // 5. Validación de Horario y Disponibilidad en Backend
  const dayOfWeek = startDate.getDay();

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

  if (activeWh.break_start && activeWh.break_end) {
    const breakStart = parseTimeOnDate(activeWh.break_start);
    const breakEnd = parseTimeOnDate(activeWh.break_end);

    if (startDate < breakEnd && endDate > breakStart) {
      return {
        error: `El horario seleccionado coincide con el descanso/almuerzo de ${staff.name}.`,
      };
    }
  }

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
    .select('id, user_id')
    .eq('tenant_id', tenantId)
    .eq('email', clientEmail.toLowerCase().trim())
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
    if (currentUser && !existingClient.user_id) {
      await supabase.from('clients').update({ user_id: currentUser.id }).eq('id', clientId);
    }
  } else {
    const { data: newClient, error: clientErr } = await supabase
      .from('clients')
      .insert({
        tenant_id: tenantId,
        user_id: currentUser ? currentUser.id : null,
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
      branch_id: branchId || staff.branch_id || null,
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

  // 8. Crear notificaciones persistentes
  const formattedDate = startDate.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Notificación para Admin (Dashboard)
  await PersistentNotificationService.create(supabase, {
    tenantId,
    clientId: null, // Destinada al Administrador
    appointmentId: newApp.id,
    type: 'appointment_created',
    title: 'Nueva solicitud de cita',
    message: `Cliente: ${clientName.trim()} | Servicio: ${service.name} | Profesional: ${staff.name} | Fecha: ${formattedDate} | Hora: ${formattedTime}`,
    metadata: {
      client_name: clientName.trim(),
      client_email: clientEmail.trim(),
      client_phone: clientPhone.trim(),
      service_name: service.name,
      staff_name: staff.name,
      appointment_date: formattedDate,
      appointment_time: formattedTime,
    },
  });

  // Notificación automática por WhatsApp desde el servidor al cliente
  const whatsappMsg = WhatsAppService.generateBookingMessage({
    businessName: tenant.name,
    serviceName: service.name,
    staffName: staff.name,
    dateFormatted: formattedDate,
    timeFormatted: formattedTime,
    totalPrice: service.price,
    clientName: clientName.trim(),
    clientPhone: clientPhone.trim(),
  });

  await sendServerWhatsAppNotification({
    phone: clientPhone.trim(),
    message: whatsappMsg,
  });

  revalidatePath('/appointments');
  revalidatePath('/notifications');
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/book`);

  return { success: true, appointment: newApp };
}

/**
 * Obtiene las citas (Próximas e Historial) para el cliente actualmente autenticado
 */
export async function getClientAppointmentsAction(slug: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { upcoming: [], history: [] };
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) return { upcoming: [], history: [] };

  // Buscar el cliente por user_id o email
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('tenant_id', tenant.id)
    .or(`user_id.eq.${user.id},email.eq.${user.email?.toLowerCase().trim()}`)
    .maybeSingle();

  if (!client) return { upcoming: [], history: [] };

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(id, name, duration_minutes, price),
      staff:staff(id, name, color, avatar_url),
      branch:branches(id, name, address, phone)
    `)
    .eq('tenant_id', tenant.id)
    .eq('client_id', client.id)
    .order('start_time', { ascending: false });

  if (!appointments) return { upcoming: [], history: [] };

  const now = new Date();
  const upcoming = appointments.filter((app) => {
    const isFuture = new Date(app.start_time) >= now;
    return isFuture && app.status !== 'cancelled' && app.status !== 'completed';
  });

  const history = appointments.filter((app) => {
    const isPast = new Date(app.start_time) < now;
    return isPast || app.status === 'cancelled' || app.status === 'completed';
  });

  return { upcoming, history };
}

/**
 * Permite al cliente cancelar su propia cita
 */
export async function cancelAppointmentAction(input: {
  slug: string;
  appointmentId: string;
  reason?: string;
}) {
  const { slug, appointmentId, reason } = input;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Debes iniciar sesión para cancelar una cita.' };

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) return { error: 'Negocio no encontrado.' };

  // Buscar la cita y verificar propiedad
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(id, name, email, phone, user_id),
      service:services(name),
      staff:staff(name)
    `)
    .eq('id', appointmentId)
    .eq('tenant_id', tenant.id)
    .maybeSingle();

  if (!appointment) return { error: 'La cita no existe o ya no está disponible.' };

  if (appointment.status === 'cancelled') {
    return { error: 'La cita ya fue cancelada previamente.' };
  }

  // Actualizar estado a cancelada
  const { error: updateErr } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      notes: reason ? `[Cancelada por cliente] ${reason}` : appointment.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId);

  if (updateErr) {
    return { error: 'Error al cancelar la cita: ' + updateErr.message };
  }

  // Crear notificación persistente para Admin y Cliente
  const dateObj = new Date(appointment.start_time);
  const formattedDate = dateObj.toLocaleDateString('es-CO');
  const formattedTime = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  await PersistentNotificationService.create(supabase, {
    tenantId: tenant.id,
    clientId: null, // Destinada al Administrador
    appointmentId,
    type: 'appointment_cancelled',
    title: 'Cita cancelada por cliente',
    message: `El cliente ${appointment.client?.name || ''} canceló su cita de ${appointment.service?.name || 'servicio'} programada para el ${formattedDate} a las ${formattedTime}.`,
  });

  revalidatePath('/appointments');
  revalidatePath('/notifications');
  revalidatePath(`/${slug}`);

  return { success: true };
}

/**
 * Permite al cliente reagendar su propia cita
 */
export async function rescheduleAppointmentAction(input: {
  slug: string;
  appointmentId: string;
  newStartTimeIso: string;
  newStaffId?: string;
}) {
  const { slug, appointmentId, newStartTimeIso, newStaffId } = input;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Debes iniciar sesión para reagendar tu cita.' };

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) return { error: 'Negocio no encontrado.' };

  const newStartDate = new Date(newStartTimeIso);
  if (isNaN(newStartDate.getTime()) || newStartDate < new Date()) {
    return { error: 'La nueva fecha y hora seleccionada no es válida.' };
  }

  // Cargar cita actual con servicio
  const { data: currentApp } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(*),
      client:clients(id, name, email, phone)
    `)
    .eq('id', appointmentId)
    .eq('tenant_id', tenant.id)
    .maybeSingle();

  if (!currentApp) return { error: 'No se encontró la cita a reagendar.' };

  const targetStaffId = newStaffId || currentApp.staff_id;
  const service = currentApp.service;

  const totalDurationMinutes = service.duration_minutes + (service.buffer_time_minutes || 0);
  const newEndDate = new Date(newStartDate.getTime() + totalDurationMinutes * 60 * 1000);

  // Comprobar solapamientos
  const { data: existingApps } = await supabase
    .from('appointments')
    .select('id, start_time, end_time')
    .eq('tenant_id', tenant.id)
    .eq('staff_id', targetStaffId)
    .neq('id', appointmentId)
    .neq('status', 'cancelled');

  if (existingApps) {
    const overlaps = existingApps.some((app) => {
      const appStart = new Date(app.start_time);
      const appEnd = new Date(app.end_time);
      return newStartDate < appEnd && newEndDate > appStart;
    });

    if (overlaps) {
      return { error: 'El nuevo horario ya no se encuentra disponible. Por favor elige otro.' };
    }
  }

  // Actualizar cita
  const { error: updateErr } = await supabase
    .from('appointments')
    .update({
      staff_id: targetStaffId,
      start_time: newStartDate.toISOString(),
      end_time: newEndDate.toISOString(),
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId);

  if (updateErr) return { error: 'Error al actualizar el horario: ' + updateErr.message };

  const formattedDate = newStartDate.toLocaleDateString('es-CO');
  const formattedTime = newStartDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  await PersistentNotificationService.create(supabase, {
    tenantId: tenant.id,
    clientId: null, // Destinada al Administrador
    appointmentId,
    type: 'reservation_changed',
    title: 'Cita Reagendada por cliente',
    message: `La cita de ${currentApp.client?.name || 'cliente'} para ${service.name} fue reagendada para el ${formattedDate} a las ${formattedTime}.`,
  });

  revalidatePath('/appointments');
  revalidatePath('/notifications');
  revalidatePath(`/${slug}`);

  return { success: true };
}

/**
 * Obtiene notificaciones persistentes para el cliente autenticado
 */
export async function getClientNotificationsAction(slug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { notifications: [], unreadCount: 0 };

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) return { notifications: [], unreadCount: 0 };

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('tenant_id', tenant.id)
    .or(`user_id.eq.${user.id},email.eq.${user.email?.toLowerCase().trim()}`)
    .maybeSingle();

  if (!client) return { notifications: [], unreadCount: 0 };

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return { notifications: notifications || [], unreadCount };
}

/**
 * Marca una notificación de cliente como leída
 */
export async function markClientNotificationReadAction(notificationId: string) {
  const supabase = await createClient();
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  return { success: true };
}

/**
 * Marca todas las notificaciones del cliente como leídas
 */
export async function markAllClientNotificationsReadAction(slug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) return { success: false };

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('tenant_id', tenant.id)
    .or(`user_id.eq.${user.id},email.eq.${user.email?.toLowerCase().trim()}`)
    .maybeSingle();

  if (client) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('tenant_id', tenant.id)
      .eq('client_id', client.id)
      .eq('is_read', false);
  }

  return { success: true };
}
