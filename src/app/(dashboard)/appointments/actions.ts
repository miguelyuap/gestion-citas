'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { AppointmentStatus, AppointmentWithDetails, Client, Service, Staff, WorkingHour } from '@/types/database';
import { PersistentNotificationService } from '@/lib/services/persistent-notification.service';
import { getTenantIdForUser } from '@/lib/services/tenant-context.service';


export async function getAppointmentsDataAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: 'No autorizado',
      appointments: [],
      staffList: [],
      servicesList: [],
      clientsList: [],
      workingHoursList: [],
    };
  }

  const tenantId = await getTenantIdForUser(supabase, user);

  if (!tenantId) {
    return {
      error: 'No se encontró la empresa/tenant',
      appointments: [],
      staffList: [],
      servicesList: [],
      clientsList: [],
      workingHoursList: [],
    };
  }

  // 1. Obtener Citas con datos relacionados
  const { data: appointments, error: appError } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      service:services(*),
      staff:staff(*)
    `)
    .eq('tenant_id', tenantId)
    .order('start_time', { ascending: false });

  if (appError) {
    console.error('Error fetching appointments:', appError);
  }

  // 2. Obtener Lista de Personal
  const { data: staffList } = await supabase
    .from('staff')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name');

  // 3. Obtener Lista de Servicios
  const { data: servicesList } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name');

  // 4. Obtener Lista de Clientes
  const { data: clientsList } = await supabase
    .from('clients')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name');

  // 5. Obtener Horarios de Atención (working_hours) del Tenant
  const { data: workingHoursList } = await supabase
    .from('working_hours')
    .select('*')
    .eq('tenant_id', tenantId);

  return {
    appointments: (appointments as AppointmentWithDetails[]) || [],
    staffList: (staffList as Staff[]) || [],
    servicesList: (servicesList as Service[]) || [],
    clientsList: (clientsList as Client[]) || [],
    workingHoursList: (workingHoursList as WorkingHour[]) || [],
  };
}

export async function confirmAppointmentAction(appointmentId: string) {
  if (!appointmentId) {
    return { error: 'ID de cita no provisto.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: 'No se encontró el negocio.' };

  // 1. Actualizar estado en Supabase
  const { data: updatedApp, error } = await supabase
    .from('appointments')
    .update({
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId)
    .eq('tenant_id', profile.tenant_id)
    .select(`
      *,
      client:clients(*),
      service:services(*),
      staff:staff(*)
    `)
    .single();

  if (error || !updatedApp) {
    return { error: 'Error al confirmar la cita: ' + (error?.message || 'Cita no encontrada') };
  }

  // 2. Crear notificación persistente en DB
  const clientName = updatedApp.client?.name || 'Cliente';
  const serviceName = updatedApp.service?.name || 'Servicio';
  const staffName = updatedApp.staff?.name || 'Especialista';
  const appTime = new Date(updatedApp.start_time).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  await PersistentNotificationService.create(supabase, {
    tenantId: profile.tenant_id,
    clientId: updatedApp.client_id,
    appointmentId,
    type: 'appointment_confirmed',
    title: 'Tu cita fue confirmada.',
    message: `Hola ${clientName}, tu cita para ${serviceName} con ${staffName} el ${appTime} ha sido confirmada correctamente.`,
    metadata: {
      client_name: clientName,
      service_name: serviceName,
      staff_name: staffName,
      start_time: updatedApp.start_time,
    },
  });

  revalidatePath('/appointments');
  revalidatePath('/notifications');
  return { success: true, appointment: updatedApp };
}

export async function cancelAppointmentAction(
  appointmentId: string,
  cancellationReason: string,
  canReschedule: boolean
) {
  if (!appointmentId) {
    return { error: 'ID de cita no provisto.' };
  }

  if (!cancellationReason || cancellationReason.trim().length === 0) {
    return { error: 'Debe especificar un motivo de cancelación obligatorio.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: 'No se encontró el negocio.' };

  // 1. Actualizar estado y motivo en Supabase
  const { data: updatedApp, error } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancellation_reason: cancellationReason.trim(),
      can_reschedule: canReschedule,
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId)
    .eq('tenant_id', profile.tenant_id)
    .select(`
      *,
      client:clients(*),
      service:services(*),
      staff:staff(*)
    `)
    .single();

  if (error || !updatedApp) {
    return { error: 'Error al cancelar la cita: ' + (error?.message || 'Cita no encontrada') };
  }

  // 2. Crear notificación persistente de cancelación con motivo y reprogramación
  const clientName = updatedApp.client?.name || 'Cliente';
  const serviceName = updatedApp.service?.name || 'Servicio';
  const appTime = new Date(updatedApp.start_time).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  await PersistentNotificationService.create(supabase, {
    tenantId: profile.tenant_id,
    clientId: updatedApp.client_id,
    appointmentId,
    type: 'appointment_cancelled',
    title: 'Tu cita fue cancelada.',
    message: `Hola ${clientName}, tu cita para ${serviceName} agendada el ${appTime} ha sido cancelada. Motivo: "${cancellationReason.trim()}". ${
      canReschedule ? '¿Puede reprogramarse? Sí' : '¿Puede reprogramarse? No'
    }`,
    metadata: {
      cancellation_reason: cancellationReason.trim(),
      can_reschedule: canReschedule,
      client_name: clientName,
      service_name: serviceName,
    },
  });

  revalidatePath('/appointments');
  revalidatePath('/notifications');
  return { success: true, appointment: updatedApp };
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  newStatus: AppointmentStatus
) {
  if (!appointmentId || !newStatus) {
    return { error: 'Datos insuficientes para actualizar el estado.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: 'No se encontró el negocio.' };

  const { data: updatedApp, error } = await supabase
    .from('appointments')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId)
    .eq('tenant_id', profile.tenant_id)
    .select(`
      *,
      client:clients(*),
      service:services(*),
      staff:staff(*)
    `)
    .single();

  if (error || !updatedApp) {
    return { error: 'Error al cambiar estado: ' + (error?.message || 'Cita no encontrada') };
  }

  // Notificación persistente de cambio de estado
  const clientName = updatedApp.client?.name || 'Cliente';
  const serviceName = updatedApp.service?.name || 'Servicio';
  const notifType = newStatus === 'completed' ? 'appointment_completed' : 'reservation_changed';

  const estadoText =
    newStatus === 'completed'
      ? 'completada'
      : newStatus === 'confirmed'
      ? 'confirmada'
      : newStatus === 'cancelled'
      ? 'cancelada'
      : newStatus;

  await PersistentNotificationService.create(supabase, {
    tenantId: profile.tenant_id,
    clientId: updatedApp.client_id,
    appointmentId,
    type: notifType,
    title: `Cita ${estadoText}`,
    message: `La cita de ${clientName} para ${serviceName} ha sido marcada como ${estadoText}.`,
    metadata: {
      new_status: newStatus,
      client_name: clientName,
      service_name: serviceName,
    },
  });

  revalidatePath('/appointments');
  revalidatePath('/notifications');

  return { success: true, appointment: updatedApp };
}

export async function createAdminAppointmentAction(formData: FormData) {
  const service_id = formData.get('service_id') as string;
  const staff_id = formData.get('staff_id') as string;
  const client_name = formData.get('client_name') as string;
  const client_email = formData.get('client_email') as string;
  const client_phone = formData.get('client_phone') as string;
  const start_time = formData.get('start_time') as string; // Cadena ISO de inicio
  const notes = (formData.get('notes') as string) || '';

  if (!service_id || !staff_id || !client_name || !start_time) {
    return {
      error:
        'Por favor completa todos los campos requeridos: servicio, especialista, cliente y fecha/hora de inicio.',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: 'No se encontró el negocio.' };

  const tenantId = profile.tenant_id;

  // 1. Buscar servicio para duración y precio
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', service_id)
    .eq('tenant_id', tenantId)
    .single();

  if (!service) return { error: 'El servicio seleccionado no existe o no está habilitado.' };

  // 2. Buscar especialista
  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('id', staff_id)
    .eq('tenant_id', tenantId)
    .single();

  if (!staff || !staff.is_active) {
    return { error: 'El especialista seleccionado no existe o está inactivo.' };
  }

  // 3. Validación de Horario y Disponibilidad en Backend (REGLA FUNDAMENTAL)
  const startDate = new Date(start_time);
  if (isNaN(startDate.getTime())) {
    return { error: 'La fecha y hora de inicio son inválidas.' };
  }

  const dayOfWeek = startDate.getDay(); // 0 = Domingo, 1 = Lunes...

  // Consultar working_hours para el especialista (o general del negocio) en el día de la semana
  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('tenant_id', tenantId)
    .or(`staff_id.eq.${staff_id},staff_id.is.null`)
    .eq('day_of_week', dayOfWeek);

  // Priorizar horario específico del staff, de lo contrario horario general (staff_id IS NULL)
  const specificWh = workingHours?.find((wh) => wh.staff_id === staff_id);
  const generalWh = workingHours?.find((wh) => wh.staff_id === null);
  const activeWh = specificWh || generalWh;

  if (!activeWh || activeWh.is_day_off) {
    return {
      error: `El profesional ${staff.name} no labora en el día seleccionado (Día de descanso o no configurado).`,
    };
  }

  // Validar límites de jornada laboral
  const parseTimeOnDate = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(startDate);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const workStart = parseTimeOnDate(activeWh.start_time);
  const workEnd = parseTimeOnDate(activeWh.end_time);
  const totalDurationMinutes = service.duration_minutes + (service.buffer_time_minutes || 0);
  const endDate = new Date(startDate.getTime() + totalDurationMinutes * 60 * 1000);

  if (startDate < workStart || endDate > workEnd) {
    return {
      error: `El horario elegido (${startDate.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      })}) está fuera de la jornada laboral de ${staff.name} (${activeWh.start_time} - ${activeWh.end_time}).`,
    };
  }

  // Validar solapamiento con descanso (almuerzo)
  if (activeWh.break_start && activeWh.break_end) {
    const breakStart = parseTimeOnDate(activeWh.break_start);
    const breakEnd = parseTimeOnDate(activeWh.break_end);

    if (startDate < breakEnd && endDate > breakStart) {
      return {
        error: `El horario elegido coincide con el descanso/almuerzo de ${staff.name} (${activeWh.break_start} - ${activeWh.break_end}).`,
      };
    }
  }

  // Validar solapamiento con citas existentes
  const { data: existingApps } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('tenant_id', tenantId)
    .eq('staff_id', staff_id)
    .neq('status', 'cancelled');

  if (existingApps) {
    const overlaps = existingApps.some((app) => {
      const appStart = new Date(app.start_time);
      const appEnd = new Date(app.end_time);
      return startDate < appEnd && endDate > appStart;
    });

    if (overlaps) {
      return {
        error: `El profesional ${staff.name} ya tiene una cita agendada en ese rango horario.`,
      };
    }
  }

  // 4. Buscar o Crear Cliente
  let clientId: string;
  const tempEmail = client_email || `cliente_${Date.now()}@temp.com`;

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('email', tempEmail)
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const { data: newClient, error: clientErr } = await supabase
      .from('clients')
      .insert({
        tenant_id: tenantId,
        name: client_name,
        email: tempEmail,
        phone: client_phone || 'N/A',
      })
      .select('id')
      .single();

    if (clientErr || !newClient) {
      return { error: 'Error al registrar información del cliente: ' + (clientErr?.message || '') };
    }
    clientId = newClient.id;
  }

  // 5. Insertar Cita en Supabase
  const { data: newApp, error: appErr } = await supabase
    .from('appointments')
    .insert({
      tenant_id: tenantId,
      service_id,
      staff_id,
      client_id: clientId,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: 'confirmed',
      total_price: service.price,
      notes,
    })
    .select(`
      *,
      client:clients(*),
      service:services(*),
      staff:staff(*)
    `)
    .single();

  if (appErr || !newApp) {
    if (appErr?.code === '23505' || appErr?.message?.includes('no_overlapping_staff_appointments')) {
      return { error: 'Conflicto de horario: El especialista ya cuenta con una cita en ese mismo bloque.' };
    }
    return { error: 'Error al agendar la cita: ' + (appErr?.message || '') };
  }

  // 6. Registro de notificación persistente de nueva cita
  const formattedDate = startDate.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  await PersistentNotificationService.create(supabase, {
    tenantId,
    clientId,
    appointmentId: newApp.id,
    type: 'appointment_created',
    title: 'Nueva solicitud de cita',
    message: `Cliente: ${client_name} | Servicio: ${service.name} | Profesional: ${staff.name} | Fecha: ${formattedDate} | Hora: ${formattedTime}`,
    metadata: {
      client_name: client_name,
      service_name: service.name,
      staff_name: staff.name,
      appointment_date: formattedDate,
      appointment_time: formattedTime,
    },
  });

  revalidatePath('/appointments');
  revalidatePath('/notifications');
  return { success: true, appointment: newApp };
}

