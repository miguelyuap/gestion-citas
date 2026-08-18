'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Scissors,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';
import { generateAvailableSlots, getEffectiveWorkingHour } from '@/lib/availability';
import { Appointment, Service, Staff, TimeSlot, WorkingHour } from '@/types/database';
import { createPublicAppointmentAction } from '@/app/(public)/[slug]/book/actions';
import NotificationService from '@/lib/services/notification.service';

interface TimeSlotPickerProps {
  tenantSlug?: string;
  service: Service;
  staffMembers: Staff[];
  workingHours?: WorkingHour[];
  workingHoursMap?: Record<string, WorkingHour[]>; // Fallback para compatibilidad
  existingAppointmentsMap?: Record<string, Appointment[]>; // staffId -> Appointment[]
  allAppointments?: Appointment[]; // Fallback
  onConfirmBooking?: (bookingDetails: {
    staff: Staff;
    service: Service;
    date: Date;
    slot: TimeSlot;
  }) => void;
}

export function TimeSlotPicker({
  tenantSlug,
  service,
  staffMembers,
  workingHours,
  workingHoursMap,
  existingAppointmentsMap = {},
  allAppointments = [],
  onConfirmBooking,
}: TimeSlotPickerProps) {
  // Lista unificada de workingHours
  const flatWorkingHours = useMemo(() => {
    if (workingHours && workingHours.length > 0) return workingHours;
    if (workingHoursMap) {
      return Object.values(workingHoursMap).flat();
    }
    return [];
  }, [workingHours, workingHoursMap]);

  // Estado inicial
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(staffMembers[0] || null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Modal de confirmación de datos del cliente
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [bookedSuccess, setBookedSuccess] = useState(false);

  // Días disponibles para selector (próximos 14 días)
  const availableDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => addDays(today, i));
  }, []);

  // Calcular slots disponibles dinámicamente aplicando la regla de prioridad
  const slots = useMemo(() => {
    if (!selectedStaff) return [];

    const dayOfWeek = selectedDate.getDay();
    // Resolver horario efectivo (Horario por Profesional > Horario General)
    const effectiveWorkingHour = getEffectiveWorkingHour(
      flatWorkingHours,
      selectedStaff.id,
      dayOfWeek
    );

    // Obtener citas del staff
    const staffAppointments =
      existingAppointmentsMap[selectedStaff.id] ||
      allAppointments.filter((a) => a.staff_id === selectedStaff.id);

    return generateAvailableSlots({
      selectedDate,
      serviceDurationMinutes: service.duration_minutes,
      bufferMinutes: service.buffer_time_minutes,
      workingHour: effectiveWorkingHour,
      existingAppointments: staffAppointments,
      slotIntervalMinutes: service.duration_minutes > 0 ? service.duration_minutes : 30,
    });
  }, [
    selectedStaff,
    selectedDate,
    service,
    flatWorkingHours,
    existingAppointmentsMap,
    allAppointments,
  ]);

  const handleOpenClientModal = () => {
    if (!selectedSlot || !selectedStaff) return;
    setErrorMsg(null);
    setIsClientModalOpen(true);
  };

  const handleFinalBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedStaff) return;

    if (!clientName || !clientEmail || !clientPhone) {
      setErrorMsg('Por favor completa todos los campos requeridos (*)');
      return;
    }

    if (tenantSlug) {
      startTransition(async () => {
        const res = await createPublicAppointmentAction({
          slug: tenantSlug,
          serviceId: service.id,
          staffId: selectedStaff.id,
          startTimeIso: selectedSlot.start.toISOString(),
          clientName,
          clientEmail,
          clientPhone,
          notes,
        });

        if (res?.error) {
          setErrorMsg(res.error);
          NotificationService.error('Error al Agendar', res.error);
        } else {
          setIsClientModalOpen(false);
          setBookedSuccess(true);
          NotificationService.success(
            '¡Cita Agendada Exitosamente!',
            `Te esperamos el ${format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} a las ${selectedSlot.formattedStart} hs con ${selectedStaff.name}.`
          );

          if (onConfirmBooking) {
            onConfirmBooking({
              staff: selectedStaff,
              service,
              date: selectedDate,
              slot: selectedSlot,
            });
          }
        }
      });
    } else {
      // Si se invoca sin slug (modo simulación / preview)
      setIsClientModalOpen(false);
      setBookedSuccess(true);
      if (onConfirmBooking) {
        onConfirmBooking({
          staff: selectedStaff,
          service,
          date: selectedDate,
          slot: selectedSlot,
        });
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/90 text-white backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
      {/* Header del Servicio */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold flex items-center gap-1.5">
            <Scissors className="w-4 h-4" /> Agendamiento en Línea
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-slate-100">{service.name}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {service.description || 'Reserva tu cita fácil y rápido en 3 pasos.'}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-300 text-sm font-medium">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{service.duration_minutes} min</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-emerald-400 font-bold text-lg">
            ${Number(service.price).toLocaleString('es-CO')}{' '}
            <span className="text-xs text-slate-400">{service.currency}</span>
          </div>
        </div>
      </div>

      {/* Paso 1: Selección de Especialista */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" /> 1. Selecciona el Profesional
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {staffMembers.map((staff) => {
            const isSelected = selectedStaff?.id === staff.id;
            return (
              <button
                key={staff.id}
                onClick={() => {
                  setSelectedStaff(staff);
                  setSelectedSlot(null);
                  setBookedSuccess(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner flex-shrink-0"
                  style={{ backgroundColor: staff.color }}
                >
                  {staff.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm truncate text-slate-100">{staff.name}</p>
                  <p className="text-xs text-slate-400 truncate">Disponible para agendar</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paso 2: Selección de Fecha */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-400" /> 2. Elige el Día
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {availableDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setSelectedSlot(null);
                  setBookedSuccess(false);
                }}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-20 py-3 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/20 font-bold scale-105'
                    : 'bg-slate-800/40 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs capitalize text-slate-300">
                  {format(day, 'EEE', { locale: es })}
                </span>
                <span className="text-lg font-bold my-0.5">{format(day, 'dd')}</span>
                <span className="text-[10px] capitalize text-slate-400">
                  {format(day, 'MMM', { locale: es })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paso 3: Horarios Disponibles */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> 3. Selecciona la Hora
          </label>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Disponible
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span> Ocupado / Descanso
            </span>
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="bg-slate-800/30 border border-dashed border-slate-700/60 rounded-2xl p-6 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
            <p className="font-medium text-slate-200">No hay horarios disponibles para esta fecha.</p>
            <p className="text-xs mt-1 text-slate-400">
              El profesional no atiende este día o se trata de un día libre configurado. Intenta seleccionar otra fecha u otro especialista.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {slots.map((slot, index) => {
              const isSelected = selectedSlot?.formattedStart === slot.formattedStart;
              return (
                <button
                  key={index}
                  disabled={!slot.available}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setBookedSuccess(false);
                  }}
                  title={slot.reason || (slot.available ? 'Disponible' : 'No disponible')}
                  className={`py-3 px-2 rounded-xl text-center font-medium text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 scale-105 ring-2 ring-emerald-300'
                      : slot.available
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50'
                      : 'bg-slate-800/20 text-slate-600 border border-slate-800/40 cursor-not-allowed line-through'
                  }`}
                >
                  {slot.formattedStart}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / Resumen y Confirmación */}
      {selectedSlot && (
        <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/40 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Resumen de tu Reserva</p>
            <p className="font-bold text-lg text-white">
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} a las {selectedSlot.formattedStart} hs
            </p>
            <p className="text-xs text-slate-300">
              Con <span className="font-semibold text-indigo-200">{selectedStaff?.name}</span> • Duración: {service.duration_minutes} min
            </p>
          </div>

          <button
            onClick={handleOpenClientModal}
            disabled={bookedSuccess}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {bookedSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" /> ¡Cita Confirmada!
              </>
            ) : (
              'Confirmar Cita'
            )}
          </button>
        </div>
      )}

      {/* Modal de Formulario de Datos del Cliente */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsClientModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Completa tu Reserva
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Tus Datos de Contacto</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ingresa tus datos para recibir la confirmación de tu turno.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleFinalBookingSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="ej: María Gómez"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="maria@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" /> Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Notas adicionales (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Algún requerimiento especial..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending ? 'Confirmando...' : 'Finalizar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
