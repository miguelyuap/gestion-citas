'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Staff, WorkingHour } from '@/types/database';

export interface DayScheduleInput {
  day_of_week: number;
  is_day_off: boolean;
  start_time: string; // e.g. "08:00" or "08:00:00"
  end_time: string;   // e.g. "17:00" or "17:00:00"
  has_break: boolean;
  break_start?: string | null; // e.g. "12:00"
  break_end?: string | null;   // e.g. "13:00"
}

function normalizeTime(t: string | null | undefined): string | null {
  if (!t) return null;
  const trimmed = t.trim();
  if (!trimmed) return null;
  if (trimmed.length === 5) return `${trimmed}:00`;
  return trimmed;
}

/**
 * Validar consistencia de horarios y descansos
 */
function validateDaySchedule(input: DayScheduleInput): string | null {
  if (input.is_day_off) return null;

  const startTime = normalizeTime(input.start_time);
  const endTime = normalizeTime(input.end_time);

  if (!startTime || !endTime) {
    return `Para el día ${input.day_of_week}, debe especificar la hora de inicio y hora de fin.`;
  }

  if (endTime <= startTime) {
    return `La hora de fin (${input.end_time}) debe ser mayor a la hora de inicio (${input.start_time}).`;
  }

  if (input.has_break) {
    const breakStart = normalizeTime(input.break_start);
    const breakEnd = normalizeTime(input.break_end);

    if (!breakStart || !breakEnd) {
      return `Debe indicar tanto el inicio como el fin del descanso si la opción está activada.`;
    }

    if (breakEnd <= breakStart) {
      return `La hora de fin del descanso (${input.break_end}) debe ser mayor a la de inicio (${input.break_start}).`;
    }

    if (breakStart < startTime || breakEnd > endTime) {
      return `El descanso (${input.break_start} - ${input.break_end}) debe estar dentro de la jornada laboral (${input.start_time} - ${input.end_time}).`;
    }
  }

  return null;
}

/**
 * Obtener todos los datos necesarios para la gestión de horarios
 */
export async function getSchedulesDataAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado', workingHours: [], staffList: [] };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) {
    return { error: 'No se encontró el negocio/tenant', workingHours: [], staffList: [] };
  }

  const tenantId = profile.tenant_id;

  const [{ data: workingHours, error: whError }, { data: staffList, error: staffError }] =
    await Promise.all([
      supabase.from('working_hours').select('*').eq('tenant_id', tenantId),
      supabase.from('staff').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('name'),
    ]);

  if (whError) {
    console.error('Error fetching working_hours:', whError);
  }
  if (staffError) {
    console.error('Error fetching staff list:', staffError);
  }

  return {
    workingHours: (workingHours as WorkingHour[]) || [],
    staffList: (staffList as Staff[]) || [],
    tenantId,
  };
}

/**
 * Guardar / Actualizar Horarios Generales del Negocio (staff_id IS NULL)
 */
export async function saveGeneralWorkingHoursAction(schedules: DayScheduleInput[]) {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return { error: 'No se proporcionaron datos de horario.' };
  }

  // Validaciones
  for (const day of schedules) {
    const validationErr = validateDaySchedule(day);
    if (validationErr) return { error: validationErr };
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

  // Consultar registros existentes de horario general
  const { data: existingGeneralHours } = await supabase
    .from('working_hours')
    .select('id, day_of_week')
    .eq('tenant_id', tenantId)
    .is('staff_id', null);

  const existingMap = new Map<number, string>();
  existingGeneralHours?.forEach((row) => existingMap.set(row.day_of_week, row.id));

  // Preparar payload
  const upsertRows = schedules.map((s) => {
    const existingId = existingMap.get(s.day_of_week);
    const row: any = {
      tenant_id: tenantId,
      staff_id: null,
      day_of_week: s.day_of_week,
      start_time: normalizeTime(s.start_time) || '08:00:00',
      end_time: normalizeTime(s.end_time) || '17:00:00',
      is_day_off: s.is_day_off,
      break_start: s.has_break && !s.is_day_off ? normalizeTime(s.break_start) : null,
      break_end: s.has_break && !s.is_day_off ? normalizeTime(s.break_end) : null,
    };
    if (existingId) {
      row.id = existingId;
    }
    return row;
  });

  const { error } = await supabase.from('working_hours').upsert(upsertRows, {
    onConflict: 'id',
  });

  if (error) {
    console.error('Error saving general working hours:', error);
    return { error: 'Error al guardar los horarios generales: ' + error.message };
  }

  revalidatePath('/schedules');
  revalidatePath('/[slug]', 'layout');
  return { success: true };
}

/**
 * Guardar / Actualizar Horarios Específicos de un Profesional o Restablecer al Horario General
 */
export async function saveStaffWorkingHoursAction(
  staffId: string,
  schedules: DayScheduleInput[],
  useGeneralSchedule: boolean
) {
  if (!staffId) {
    return { error: 'Debe especificar el profesional.' };
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

  // Si opta por usar el horario general del negocio, eliminar horarios personalizados
  if (useGeneralSchedule) {
    const { error: deleteErr } = await supabase
      .from('working_hours')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('staff_id', staffId);

    if (deleteErr) {
      return { error: 'Error al restablecer al horario general: ' + deleteErr.message };
    }

    revalidatePath('/schedules');
    revalidatePath('/[slug]', 'layout');
    return { success: true, message: 'Se ha restablecido el horario al general del negocio.' };
  }

  // Si no, validar datos ingresados
  for (const day of schedules) {
    const validationErr = validateDaySchedule(day);
    if (validationErr) return { error: validationErr };
  }

  // Consultar registros existentes para este staff
  const { data: existingStaffHours } = await supabase
    .from('working_hours')
    .select('id, day_of_week')
    .eq('tenant_id', tenantId)
    .eq('staff_id', staffId);

  const existingMap = new Map<number, string>();
  existingStaffHours?.forEach((row) => existingMap.set(row.day_of_week, row.id));

  // Preparar payload
  const upsertRows = schedules.map((s) => {
    const existingId = existingMap.get(s.day_of_week);
    const row: any = {
      tenant_id: tenantId,
      staff_id: staffId,
      day_of_week: s.day_of_week,
      start_time: normalizeTime(s.start_time) || '08:00:00',
      end_time: normalizeTime(s.end_time) || '17:00:00',
      is_day_off: s.is_day_off,
      break_start: s.has_break && !s.is_day_off ? normalizeTime(s.break_start) : null,
      break_end: s.has_break && !s.is_day_off ? normalizeTime(s.break_end) : null,
    };
    if (existingId) {
      row.id = existingId;
    }
    return row;
  });

  const { error } = await supabase.from('working_hours').upsert(upsertRows, {
    onConflict: 'id',
  });

  if (error) {
    console.error('Error saving staff working hours:', error);
    return { error: 'Error al guardar el horario del profesional: ' + error.message };
  }

  revalidatePath('/schedules');
  revalidatePath('/[slug]', 'layout');
  return { success: true };
}
