import { Appointment, TimeSlot, WorkingHour } from '@/types/database';
import { addMinutes, format, isAfter, isBefore, isEqual, parse, set } from 'date-fns';

export interface GenerateSlotsOptions {
  selectedDate: Date;
  serviceDurationMinutes: number;
  bufferMinutes?: number;
  slotIntervalMinutes?: number;
  workingHour?: WorkingHour | null;
  existingAppointments: Appointment[];
}

/**
 * Genera los intervalos de tiempo disponibles para una fecha y profesional específico
 * evitando solapamientos con citas existentes y respetando descansos y horarios de atención.
 */
export function generateAvailableSlots({
  selectedDate,
  serviceDurationMinutes,
  bufferMinutes = 0,
  slotIntervalMinutes = 30,
  workingHour,
  existingAppointments,
}: GenerateSlotsOptions): TimeSlot[] {
  if (!workingHour || workingHour.is_day_off) {
    return [];
  }

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Convertir cadenas TIME (ej: "09:00:00") a objetos Date del día seleccionado
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return set(selectedDate, { hours, minutes, seconds: 0, milliseconds: 0 });
  };

  const workStart = parseTime(workingHour.start_time);
  const workEnd = parseTime(workingHour.end_time);

  let breakStart: Date | null = null;
  let breakEnd: Date | null = null;
  if (workingHour.break_start && workingHour.break_end) {
    breakStart = parseTime(workingHour.break_start);
    breakEnd = parseTime(workingHour.break_end);
  }

  const slots: TimeSlot[] = [];
  let currentPointer = workStart;
  const totalDuration = serviceDurationMinutes + bufferMinutes;

  const now = new Date();

  while (isBefore(currentPointer, workEnd)) {
    const slotStart = currentPointer;
    const slotEnd = addMinutes(slotStart, serviceDurationMinutes);
    const slotEndWithBuffer = addMinutes(slotStart, totalDuration);

    // 1. El slot debe terminar antes o a la misma hora del fin de jornada
    if (isAfter(slotEnd, workEnd)) {
      break;
    }

    let isAvailable = true;
    let reason: string | undefined = undefined;

    // 2. Descartar slots en el pasado si la fecha es hoy
    if (isBefore(slotStart, now)) {
      isAvailable = false;
      reason = 'Hora pasada';
    }

    // 3. Verificar solapamiento con descanso / almuerzo
    if (isAvailable && breakStart && breakEnd) {
      // Un slot se solapa si slotStart < breakEnd Y slotEndWithBuffer > breakStart
      if (isBefore(slotStart, breakEnd) && isAfter(slotEndWithBuffer, breakStart)) {
        isAvailable = false;
        reason = 'Horario de descanso';
      }
    }

    // 4. Verificar solapamiento con citas existentes
    if (isAvailable) {
      for (const app of existingAppointments) {
        if (app.status === 'cancelled') continue;

        const appStart = new Date(app.start_time);
        const appEnd = new Date(app.end_time);

        // Fórmula estricta de intersección de intervalos: (A_start < B_end) AND (A_end > B_start)
        const overlaps =
          isBefore(slotStart, appEnd) && isAfter(slotEndWithBuffer, appStart);

        if (overlaps) {
          isAvailable = false;
          reason = 'Turno ocupado';
          break;
        }
      }
    }

    slots.push({
      start: slotStart,
      end: slotEnd,
      formattedStart: format(slotStart, 'HH:mm'),
      formattedEnd: format(slotEnd, 'HH:mm'),
      available: isAvailable,
      reason,
    });

    // Avanzar el puntero según el intervalo configurado (ej: cada 30 min)
    currentPointer = addMinutes(currentPointer, slotIntervalMinutes);
  }

  return slots;
}
