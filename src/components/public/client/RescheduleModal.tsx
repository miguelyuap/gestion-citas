'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { generateAvailableSlots, getEffectiveWorkingHour } from '@/lib/availability';
import { TimeSlot, WorkingHour } from '@/types/database';
import { rescheduleAppointmentAction } from '@/app/(public)/[slug]/book/actions';
import NotificationService from '@/lib/services/notification.service';
import WhatsAppService from '@/lib/services/whatsapp.service';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  businessName: string;
  businessPhone?: string;
  appointment: any;
  workingHours: WorkingHour[];
  allAppointments: any[];
  onSuccess: () => void;
}

export function RescheduleModal({
  isOpen,
  onClose,
  tenantSlug,
  businessName,
  businessPhone,
  appointment,
  workingHours,
  allAppointments,
  onSuccess,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      // Configurar fecha inicial como hoy o la fecha de la cita si es futura
      const appDate = new Date(appointment.start_time);
      if (appDate > new Date()) {
        setSelectedDate(appDate.toISOString().split('T')[0]);
      } else {
        setSelectedDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (!selectedDate || !appointment) return;

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    const effectiveWh = getEffectiveWorkingHour(
      workingHours,
      appointment.staff_id,
      dayOfWeek
    );

    const slots = generateAvailableSlots({
      selectedDate: dateObj,
      serviceDurationMinutes: appointment.service?.duration_minutes || 30,
      bufferMinutes: appointment.service?.buffer_time_minutes || 0,
      slotIntervalMinutes: 30,
      workingHour: effectiveWh,
      existingAppointments: allAppointments.filter((a) => a.id !== appointment.id),
    });

    setAvailableSlots(slots);
    setSelectedSlot(null);
  }, [selectedDate, appointment, workingHours, allAppointments]);

  if (!isOpen || !appointment) return null;

  const handleConfirmReschedule = async () => {
    if (!selectedSlot) return;

    setLoading(true);
    try {
      const res = await rescheduleAppointmentAction({
        slug: tenantSlug,
        appointmentId: appointment.id,
        newStartTimeIso: selectedSlot.start.toISOString(),
      });

      if (res.error) {
        NotificationService.error('Error al reagendar', res.error);
      } else {
        const dateFormatted = selectedSlot.start.toLocaleDateString('es-CO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });
        const timeFormatted = selectedSlot.formattedStart;

        NotificationService.success(
          '¡Cita Reagendada!',
          `Tu cita ha sido movida para el ${dateFormatted} a las ${timeFormatted}.`
        );

        onSuccess();
        onClose();
      }
    } catch (e: any) {
      NotificationService.error('Error inesperado', e?.message || 'Ocurrió un problema.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--foreground)]/10 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--background)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-[var(--foreground)]">Reagendar Cita</h3>
          <p className="text-xs text-[var(--muted)]">
            Selecciona una nueva fecha y horario para {appointment.service?.name}
          </p>
        </div>

        {/* Selección de Fecha */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-semibold text-[var(--foreground)]">
            Nueva Fecha
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[var(--background)] border border-[var(--foreground)]/10 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Horarios Disponibles */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-semibold text-[var(--foreground)]">
            Horarios Disponibles para esta fecha
          </label>

          {availableSlots.length === 0 ? (
            <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--foreground)]/10 text-center text-xs text-[var(--muted)]">
              No hay turnos disponibles para la fecha seleccionada. Por favor intenta otro día.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    !slot.available
                      ? 'bg-[var(--background)] text-[var(--muted)]/40 border-transparent cursor-not-allowed line-through'
                      : selectedSlot?.formattedStart === slot.formattedStart
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md'
                      : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)]/10 hover:border-[var(--primary)]/50'
                  }`}
                >
                  {slot.formattedStart}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-[var(--foreground)]/10 text-[var(--foreground)] font-bold text-xs hover:bg-[var(--background)] transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmReschedule}
            disabled={!selectedSlot || loading}
            className="py-2.5 px-4 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Confirmar Nuevo Horario'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
